import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithOrg } from '@/lib/auth-guard'
import { TABLES } from '@/lib/supabase/database'

// GET /api/dashboard — Dashboard KPI stats
export async function GET(_request: NextRequest) {
  try {
    const result = await requireAuthWithOrg()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Fetch all required data in parallel
    const [roomsRes, occupiedRes, checkInsRes, checkOutsRes, guestsRes, revenueRes, reservationsRes] = await Promise.all([
      // Total active rooms
      supabase
        .from(TABLES.ROOMS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true),

      // Occupied rooms
      supabase
        .from(TABLES.ROOMS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .eq('status', 'occupied'),

      // Today's check-ins
      supabase
        .from(TABLES.RESERVATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('check_in_date', today)
        .lt('check_in_date', `${today}T23:59:59`)
        .in('status', ['confirmed', 'checked_in']),

      // Today's check-outs
      supabase
        .from(TABLES.RESERVATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('check_out_date', today)
        .lt('check_out_date', `${today}T23:59:59`)
        .in('status', ['checked_in']),

      // Total guests
      supabase
        .from(TABLES.GUESTS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true),

      // Monthly revenue (completed payments this month)
      supabase
        .from(TABLES.PAYMENTS)
        .select('amount')
        .eq('organization_id', organizationId)
        .eq('status', 'completed')
        .gte('paid_at', monthStart),

      // Active reservations
      supabase
        .from(TABLES.RESERVATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .in('status', ['pending', 'confirmed', 'checked_in']),
    ])

    const totalRooms = roomsRes.count ?? 0
    const occupiedRooms = occupiedRes.count ?? 0
    const availableRooms = totalRooms - occupiedRooms
    const todayCheckIns = checkInsRes.count ?? 0
    const todayCheckOuts = checkOutsRes.count ?? 0
    const totalGuests = guestsRes.count ?? 0
    const activeReservations = reservationsRes.count ?? 0

    const monthlyRevenue = (revenueRes.data ?? []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )

    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        todayCheckIns,
        todayCheckOuts,
        totalGuests,
        monthlyRevenue,
        occupancyRate,
        activeReservations,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
