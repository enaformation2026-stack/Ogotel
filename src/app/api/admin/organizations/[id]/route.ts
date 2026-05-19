import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES, PLANS } from '@/lib/supabase/database'
import { z } from 'zod'

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().optional(),
  plan: z.enum(['trial', 'starter', 'pro', 'enterprise']).optional(),
  subscription_status: z.enum(['active', 'expired', 'suspended', 'cancelled', 'pending_payment']).optional(),
  max_hotels: z.number().int().min(1).optional(),
  max_users: z.number().int().min(1).optional(),
})

// GET /api/admin/organizations/[id] — Get single organization details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()

    const { data: org, error } = await admin
      .from(TABLES.ORGANIZATIONS)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !org) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Get member count
    const { count: memberCount } = await admin
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('is_active', true)

    // Get hotel count
    const { count: hotelCount } = await admin
      .from(TABLES.HOTELS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('is_active', true)

    // Get members list
    const { data: members } = await admin
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select(`
        id, role, is_active, created_at,
        profiles!organization_members_user_id_fkey (
          id, first_name, last_name, email, phone
        )
      `)
      .eq('organization_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      ...org,
      memberCount: memberCount ?? 0,
      hotelCount: hotelCount ?? 0,
      members: members ?? [],
    })
  } catch (error) {
    console.error('Admin organization detail error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/organizations/[id] — Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()

    // Check organization exists
    const { data: existing, error: fetchError } = await admin
      .from(TABLES.ORGANIZATIONS)
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = updateOrgSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // If plan is changing, update associated limits
    if (parsed.data.plan && parsed.data.plan !== existing.id) {
      const planDetails = PLANS[parsed.data.plan]
      if (planDetails) {
        updateData.plan = parsed.data.plan
        updateData.max_hotels = planDetails.maxHotels
        updateData.max_users = planDetails.maxUsers
      }
    }

    // Apply other fields
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone
    if (parsed.data.city !== undefined) updateData.city = parsed.data.city
    if (parsed.data.country !== undefined) updateData.country = parsed.data.country
    if (parsed.data.subscription_status !== undefined) updateData.subscription_status = parsed.data.subscription_status
    if (parsed.data.max_hotels !== undefined) updateData.max_hotels = parsed.data.max_hotels
    if (parsed.data.max_users !== undefined) updateData.max_users = parsed.data.max_users

    const { data: updated, error: updateError } = await admin
      .from(TABLES.ORGANIZATIONS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Organization update error:', updateError.message)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'organisation' },
        { status: 500 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Admin organization update error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/organizations/[id] — Soft delete organization
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()

    // Check organization exists
    const { data: existing, error: fetchError } = await admin
      .from(TABLES.ORGANIZATIONS)
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Soft delete: set subscription_status to cancelled and mark inactive
    const { error: deleteError } = await admin
      .from(TABLES.ORGANIZATIONS)
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Deactivate all members
    await admin
      .from(TABLES.ORGANIZATION_MEMBERS)
      .update({ is_active: false })
      .eq('organization_id', id)

    // Deactivate all hotels
    await admin
      .from(TABLES.HOTELS)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('organization_id', id)

    if (deleteError) {
      console.error('Organization delete error:', deleteError.message)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'organisation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Organisation "${existing.name}" supprimée avec succès`,
    })
  } catch (error) {
    console.error('Admin organization delete error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
