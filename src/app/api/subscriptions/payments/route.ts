import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithOrg } from '@/lib/auth-guard'
import { TABLES } from '@/lib/supabase/database'

// GET /api/subscriptions/payments — List payment history for organization
export async function GET(_request: NextRequest) {
  try {
    const result = await requireAuthWithOrg()
    if (result.error) return result.error

    const { supabase, organizationId } = result.ctx

    const { data: payments, error } = await supabase
      .from(TABLES.SUBSCRIPTION_PAYMENTS)
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Subscription payments fetch error:', error.message)
      return NextResponse.json(
        { error: 'Erreur lors du chargement des paiements' },
        { status: 500 }
      )
    }

    // Calculate summary
    const completed = (payments ?? []).filter((p) => p.status === 'completed')
    const totalPaid = completed.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    return NextResponse.json({
      payments: payments ?? [],
      summary: {
        totalPayments: payments?.length ?? 0,
        completedPayments: completed.length,
        totalPaid,
        currency: 'XOF',
      },
    })
  } catch (error) {
    console.error('Subscription payments error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
