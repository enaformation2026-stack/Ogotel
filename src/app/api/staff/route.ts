import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerOrManager } from '@/lib/auth-guard'
import { TABLES } from '@/lib/supabase/database'

// GET /api/staff — List organization members with their profiles
export async function GET(_request: NextRequest) {
  try {
    const result = await requireOwnerOrManager()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx

    const { data: members, error } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select(`
        id,
        role,
        is_active,
        created_at,
        profiles!organization_members_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          language,
          is_active
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Staff list error:', error.message)
      return NextResponse.json(
        { error: 'Erreur lors du chargement de l\'équipe' },
        { status: 500 }
      )
    }

    // Transform to a cleaner shape
    const staff = (members ?? []).map((m: Record<string, unknown>) => ({
      id: m.id,
      role: m.role,
      isActive: m.is_active,
      joinedAt: m.created_at,
      profile: m.profiles,
    }))

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
