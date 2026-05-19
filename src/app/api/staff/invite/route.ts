import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerOrManager } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES, PLANS } from '@/lib/supabase/database'
import { z } from 'zod'

const inviteStaffSchema = z.object({
  email: z.string().email('E-mail invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
  role: z.enum(['manager', 'receptionist', 'accountant'], {
    errorMap: () => ({ message: 'Rôle invalide (manager, receptionist, accountant)' }),
  }),
})

// POST /api/staff/invite — Invite a new staff member
export async function POST(request: NextRequest) {
  try {
    const result = await requireOwnerOrManager()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx

    // Parse and validate body
    const body = await request.json()
    const parsed = inviteStaffSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone, role } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if the organization has reached its user limit
    const { data: org, error: orgError } = await supabase
      .from(TABLES.ORGANIZATIONS)
      .select('max_users')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    const { count: currentMembers, error: countError } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (!countError && currentMembers !== null && currentMembers >= (org.max_users || 5)) {
      return NextResponse.json(
        { error: `Limite d'utilisateurs atteinte (${org.max_users}). Veuillez mettre à niveau votre abonnement.` },
        { status: 403 }
      )
    }

    // Check if a profile with this email already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    let userId: string

    if (existingProfile) {
      userId = existingProfile.id

      // Check if already a member of this org
      const { data: existingMember, error: memberCheckError } = await supabase
        .from(TABLES.ORGANIZATION_MEMBERS)
        .select('id, is_active')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single()

      if (!memberCheckError && existingMember) {
        if (existingMember.is_active) {
          return NextResponse.json(
            { error: 'Cet utilisateur est déjà membre de votre organisation' },
            { status: 409 }
          )
        }
        // Reactivate the membership
        await supabase
          .from(TABLES.ORGANIZATION_MEMBERS)
          .update({ is_active: true, role })
          .eq('id', existingMember.id)
      } else {
        // Create new membership
        const { error: insertError } = await supabase
          .from(TABLES.ORGANIZATION_MEMBERS)
          .insert({
            organization_id: organizationId,
            user_id: userId,
            role,
            is_active: true,
          })

        if (insertError) {
          console.error('Insert membership error:', insertError.message)
          return NextResponse.json(
            { error: 'Erreur lors de l\'ajout du membre' },
            { status: 500 }
          )
        }
      }
    } else {
      // Create the profile using admin client (no auth required for profile creation)
      const admin = createAdminClient()

      const { data: newProfile, error: createProfileError } = await admin
        .from(TABLES.PROFILES)
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          phone: phone || null,
          role,
          language: 'fr',
          is_active: true,
        })
        .select('id')
        .single()

      if (createProfileError || !newProfile) {
        console.error('Create profile error:', createProfileError?.message)
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil' },
          { status: 500 }
        )
      }

      userId = newProfile.id

      // Create membership
      const { error: insertError } = await admin
        .from(TABLES.ORGANIZATION_MEMBERS)
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role,
          is_active: true,
        })

      if (insertError) {
        console.error('Insert membership error:', insertError.message)
        return NextResponse.json(
          { error: 'Erreur lors de l\'ajout du membre' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Invitation envoyée à ${normalizedEmail}`,
        userId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Staff invite error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
