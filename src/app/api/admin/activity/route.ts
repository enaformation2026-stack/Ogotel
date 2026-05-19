import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

// GET /api/admin/activity — Recent platform activity (super_admin only)
export async function GET(request: NextRequest) {
  try {
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)

    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)))
    const entityType = searchParams.get('entityType') || undefined
    const organizationId = searchParams.get('organizationId') || undefined

    let query = admin
      .from(TABLES.ACTIVITY_LOG)
      .select('*, profiles!activity_log_user_id_fkey(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Activity log fetch error:', error.message)
      // Return empty if table doesn't exist yet
      return NextResponse.json({
        activities: [],
        total: 0,
      })
    }

    return NextResponse.json({
      activities: activities ?? [],
      total: activities?.length ?? 0,
    })
  } catch (error) {
    console.error('Admin activity error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
