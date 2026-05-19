import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES, PLANS } from '@/lib/supabase/database'
import { z } from 'zod'

/**
 * CinetPay Webhook Handler
 *
 * Receives payment notifications from CinetPay and updates
 * subscription status and payment records accordingly.
 *
 * Expected payload from CinetPay:
 * {
 *   cpm_trans_id: string,
 *   cpm_amount: string,
 *   cpm_currency: string,
 *   cpm_custom: string (JSON with { organizationId, plan }),
 *   cpm_status: string ("ACCEPTED" | "REFUSED" | "PENDING"),
 *   cpm_payment_date: string,
 *   cpm_phone_prefix: string,
 *   cpm_phone_num: string,
 *   signature: string,
 *   ... other CinetPay fields
 * }
 */

const webhookPayloadSchema = z.object({
  cpm_trans_id: z.string(),
  cpm_amount: z.string(),
  cpm_currency: z.string().optional(),
  cpm_custom: z.string().optional(),
  cpm_status: z.string(),
  cpm_payment_date: z.string().optional(),
  signature: z.string().optional(),
})

// POST /api/subscriptions/webhook — CinetPay payment webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = webhookPayloadSchema.safeParse(body)

    if (!parsed.success) {
      console.error('Webhook validation error:', parsed.error.issues)
      return NextResponse.json(
        { error: 'Payload invalide' },
        { status: 400 }
      )
    }

    const { cpm_trans_id, cpm_amount, cpm_custom, cpm_status, cpm_payment_date } = parsed.data

    // Parse custom data to get organizationId and plan
    let organizationId: string | null = null
    let plan: string | null = null

    try {
      const custom = cpm_custom ? JSON.parse(cpm_custom) : {}
      organizationId = custom.organizationId
      plan = custom.plan
    } catch {
      console.error('Failed to parse cpm_custom:', cpm_custom)
    }

    if (!organizationId || !plan) {
      console.error('Missing organizationId or plan in cpm_custom')
      return NextResponse.json(
        { error: 'Données de transaction incomplètes' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Record the subscription payment
    const paymentStatus = cpm_status === 'ACCEPTED' ? 'completed' : cpm_status === 'REFUSED' ? 'failed' : 'pending'

    const { error: paymentError } = await admin
      .from(TABLES.SUBSCRIPTION_PAYMENTS)
      .insert({
        organization_id: organizationId,
        amount: Number(cpm_amount) || 0,
        currency: 'XOF',
        plan,
        status: paymentStatus,
        provider: 'cinetpay',
        provider_ref: cpm_trans_id,
        paid_at: paymentStatus === 'completed' ? (cpm_payment_date || new Date().toISOString()) : null,
      })

    if (paymentError) {
      console.error('Subscription payment insert error:', paymentError.message)
    }

    // If payment was successful, update the organization's plan
    if (cpm_status === 'ACCEPTED' && plan in PLANS) {
      const planDetails = PLANS[plan as keyof typeof PLANS]

      const { error: orgUpdateError } = await admin
        .from(TABLES.ORGANIZATIONS)
        .update({
          plan,
          max_hotels: planDetails.maxHotels,
          max_users: planDetails.maxUsers,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', organizationId)

      if (orgUpdateError) {
        console.error('Organization plan update error:', orgUpdateError.message)
      }
    }

    // Always return 200 to CinetPay to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Still return 200 to avoid CinetPay retries
    return NextResponse.json({ received: true })
  }
}
