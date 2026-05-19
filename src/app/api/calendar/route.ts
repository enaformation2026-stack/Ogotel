import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithOrg } from '@/lib/auth-guard'
import { TABLES } from '@/lib/supabase/database'

// GET /api/calendar — Calendar data with rooms and overlapping reservations
export async function GET(request: NextRequest) {
  try {
    const result = await requireAuthWithOrg()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Les paramètres "from" et "to" sont requis (format YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Fetch all active rooms with their room types
    const { data: rooms, error: roomsError } = await supabase
      .from(TABLES.ROOMS)
      .select('*, room_types(id, name, base_price, max_occupancy, bed_type, amenities)')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (roomsError) {
      console.error('Calendar rooms fetch error:', roomsError.message)
      return NextResponse.json(
        { error: 'Erreur lors du chargement des chambres' },
        { status: 500 }
      )
    }

    // Fetch reservations that overlap the date range
    // Overlap condition: check_in_date < to AND check_out_date > from
    const { data: reservations, error: resError } = await supabase
      .from(TABLES.RESERVATIONS)
      .select('*, guests(id, first_name, last_name)')
      .eq('organization_id', organizationId)
      .lt('check_in_date', to)
      .gt('check_out_date', from)
      .not('status', 'eq', 'cancelled')

    if (resError) {
      console.error('Calendar reservations fetch error:', resError.message)
      return NextResponse.json(
        { error: 'Erreur lors du chargement des réservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      rooms: rooms ?? [],
      reservations: reservations ?? [],
      dateRange: { from, to },
    })
  } catch (error) {
    console.error('Calendar data error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
