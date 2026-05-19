import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

// GET /api/admin/organizations — List all organizations (super_admin only)
export async function GET(request: NextRequest) {
  try {
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || undefined
    const plan = searchParams.get('plan') || undefined
    const status = searchParams.get('status') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))

    // Build query
    let query = admin
      .from(TABLES.ORGANIZATIONS)
      .select('id, name, slug, email, phone, country, city, plan, subscription_status, max_hotels, max_users, currency, created_at, updated_at', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,slug.ilike.%${search}%`)
    }
    if (plan) {
      query = query.eq('plan', plan)
    }
    if (status) {
      query = query.eq('subscription_status', status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: organizations, count, error } = await query

    if (error) {
      console.error('Admin organizations fetch error:', error.message)
      return NextResponse.json(
        { error: 'Erreur lors du chargement des organisations' },
        { status: 500 }
      )
    }

    // Get member counts for each organization
    const orgIds = (organizations ?? []).map((o) => o.id)

    let memberCounts: Record<string, number> = {}
    if (orgIds.length > 0) {
      const { data: members } = await admin
        .from(TABLES.ORGANIZATION_MEMBERS)
        .select('organization_id', { count: 'exact', head: true })
        .eq('is_active', true)
        .in('organization_id', orgIds)

      // Aggregate counts
      if (members) {
        for (const m of members) {
          const orgId = (m as Record<string, unknown>).organization_id as string
          memberCounts[orgId] = (memberCounts[orgId] || 0) + 1
        }
      }
    }

    const enrichedOrgs = (organizations ?? []).map((o) => ({
      ...o,
      memberCount: memberCounts[o.id] || 0,
    }))

    return NextResponse.json({
      organizations: enrichedOrgs,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin organizations error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
