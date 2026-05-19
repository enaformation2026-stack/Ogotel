import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerOrManager } from '@/lib/auth-guard'
import { TABLES, PLANS } from '@/lib/supabase/database'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Plan invalide' }),
  }),
  billingEmail: z.string().email('E-mail de facturation invalide').optional(),
})

// POST /api/subscriptions/checkout — Initiate subscription plan change
export async function POST(request: NextRequest) {
  try {
    const result = await requireOwnerOrManager()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx

    // Validate body
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { plan: newPlan } = parsed.data
    const planDetails = PLANS[newPlan]

    // Fetch current organization
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

    // Cannot downgrade below current usage
    const { count: currentUsers } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    const { count: currentHotels } = await supabase
      .from(TABLES.HOTELS)
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (currentUsers !== null && currentUsers > planDetails.maxUsers) {
      return NextResponse.json(
        { error: `Impossible de passer au plan ${planDetails.name} : vous avez ${currentUsers} utilisateurs (maximum ${planDetails.maxUsers})` },
        { status: 400 }
      )
    }

    if (currentHotels !== null && currentHotels > planDetails.maxHotels) {
      return NextResponse.json(
        { error: `Impossible de passer au plan ${planDetails.name} : vous avez ${currentHotels} hôtels (maximum ${planDetails.maxHotels})` },
        { status: 400 }
      )
    }

    // In production, this would create a CinetPay payment session
    // For now, return the checkout details for the frontend to redirect
    const isUpgrade = PLANS[org.plan as keyof typeof PLANS]?.price < planDetails.price

    return NextResponse.json({
      checkout: {
        plan: newPlan,
        planName: planDetails.name,
        amount: planDetails.price,
        currency: org.currency || 'XOF',
        isUpgrade,
        // In production, this would be the CinetPay payment URL
        paymentUrl: null,
        message: isUpgrade
          ? `Passage au plan ${planDetails.name} — ${new Intl.NumberFormat('fr-FR').format(planDetails.price)} FCFA/mois`
          : `Changement vers le plan ${planDetails.name}`,
      },
    })
  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
