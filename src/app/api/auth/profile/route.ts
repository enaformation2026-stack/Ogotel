import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

// GET /api/auth/profile — Return authenticated user profile
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Fetch organization membership
    const { data: membership, error: memberError } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('*, organizations(name, slug, plan, subscription_status, logo_url)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (memberError) {
      // User exists but has no org membership — return profile without org
      return NextResponse.json({
        user: {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          gender: profile.gender,
          role: profile.role,
          language: profile.language,
          isActive: profile.is_active,
        },
        organization: null,
      })
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        gender: profile.gender,
        role: membership.role,
        language: profile.language,
        isActive: profile.is_active,
      },
      organization: {
        id: membership.organization_id,
        name: membership.organizations?.name,
        slug: membership.organizations?.slug,
        plan: membership.organizations?.plan,
        subscriptionStatus: membership.organizations?.subscription_status,
        logoUrl: membership.organizations?.logo_url,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
