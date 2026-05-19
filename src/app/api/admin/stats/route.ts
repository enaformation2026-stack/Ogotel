import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

// GET /api/admin/stats — Global platform stats (super_admin only)
export async function GET(_request: NextRequest) {
  try {
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const admin = createAdminClient()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Fetch all stats in parallel
    const [
      orgsRes,
      usersRes,
      hotelsRes,
      roomsRes,
      guestsRes,
      reservationsRes,
      paymentsRes,
      activeOrgsRes,
      planDistRes,
      monthResRes,
    ] = await Promise.all([
      // Total organizations
      admin
        .from(TABLES.ORGANIZATIONS)
        .select('id', { count: 'exact', head: true }),

      // Total users (members)
      admin
        .from(TABLES.ORGANIZATION_MEMBERS)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total hotels
      admin
        .from(TABLES.HOTELS)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total rooms
      admin
        .from(TABLES.ROOMS)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total guests
      admin
        .from(TABLES.GUESTS)
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total reservations
      admin
        .from(TABLES.RESERVATIONS)
        .select('id', { count: 'exact', head: true }),

      // Total revenue (completed payments)
      admin
        .from(TABLES.PAYMENTS)
        .select('amount')
        .eq('status', 'completed'),

      // Active organizations (subscription_status = active)
      admin
        .from(TABLES.ORGANIZATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),

      // Plan distribution
      admin
        .from(TABLES.ORGANIZATIONS)
        .select('plan'),

      // Reservations this month
      admin
        .from(TABLES.RESERVATIONS)
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart),
    ])

    const totalRevenue = (paymentsRes.data ?? []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )

    // Calculate plan distribution
    const planDistribution: Record<string, number> = {}
    for (const org of planDistRes.data ?? []) {
      const p = org.plan as string
      planDistribution[p] = (planDistribution[p] || 0) + 1
    }

    return NextResponse.json({
      stats: {
        totalOrganizations: orgsRes.count ?? 0,
        activeOrganizations: activeOrgsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalHotels: hotelsRes.count ?? 0,
        totalRooms: roomsRes.count ?? 0,
        totalGuests: guestsRes.count ?? 0,
        totalReservations: reservationsRes.count ?? 0,
        reservationsThisMonth: monthResRes.count ?? 0,
        totalRevenue,
        planDistribution,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
