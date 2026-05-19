import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithOrg } from '@/lib/auth-guard'
import { TABLES, PLANS } from '@/lib/supabase/database'

// GET /api/subscriptions — Return organization subscription info
export async function GET(_request: NextRequest) {
  try {
    const result = await requireAuthWithOrg()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx

    // Fetch organization
    const { data: org, error: orgError } = await supabase
      .from(TABLES.ORGANIZATIONS)
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Fetch current member count
    const { count: memberCount } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Fetch current hotel count
    const { count: hotelCount } = await supabase
      .from(TABLES.HOTELS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Fetch current room count
    const { count: roomCount } = await supabase
      .from(TABLES.ROOMS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Get plan details
    const planKey = (org.plan as keyof typeof PLANS) || 'trial'
    const planDetails = PLANS[planKey] || PLANS.trial

    // Fetch all available plans
    const allPlans = Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      maxHotels: plan.maxHotels,
      maxUsers: plan.maxUsers,
      maxRooms: plan.maxRooms,
      features: plan.features,
      isCurrent: key === org.plan,
    }))

    return NextResponse.json({
      subscription: {
        plan: org.plan,
        status: org.subscription_status,
        currentPeriodEnd: null, // Will be set by billing system
      },
      plan: planDetails,
      plans: allPlans,
      usage: {
        users: memberCount ?? 0,
        maxUsers: org.max_users,
        hotels: hotelCount ?? 0,
        maxHotels: org.max_hotels,
        rooms: roomCount ?? 0,
        maxRooms: planDetails.maxRooms,
      },
      billing: {
        currency: org.currency,
        email: org.email,
      },
    })
  } catch (error) {
    console.error('Subscription info error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
