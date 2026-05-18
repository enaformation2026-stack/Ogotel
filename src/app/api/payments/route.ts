import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/payments — Record a new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      reservationId,
      amount,
      method,
      mobileNumber,
      notes,
    } = body

    // Validate required fields
    if (!reservationId || !amount || !method) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Verify reservation exists
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: { hotel: true },
    })
    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    // Get a user for createdById
    const member = await db.organizationMember.findFirst({
      where: { organizationId: reservation.organizationId },
      include: { user: true },
    })
    const createdById = member?.userId ?? ''

    // Generate reference
    const count = await db.payment.count()
    const reference = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    // Create payment
    const payment = await db.payment.create({
      data: {
        organizationId: reservation.organizationId,
        hotelId: reservation.hotelId,
        reservationId,
        reference,
        amount: Number(amount),
        currency: reservation.hotel?.defaultCurrency || 'XOF',
        method,
        status: 'completed',
        mobileNumber: mobileNumber || null,
        notes: notes || null,
        paidAt: new Date(),
        createdById,
      },
      include: {
        reservation: {
          include: {
            guest: true,
            room: { include: { roomType: true } },
          },
        },
      },
    })

    // Update reservation paid amount and balance
    const newPaidAmount = (reservation.paidAmount || 0) + Number(amount)
    const newBalanceDue = reservation.totalAmount - newPaidAmount

    await db.reservation.update({
      where: { id: reservationId },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: Math.max(0, newBalanceDue),
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/payments — List payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const reservationId = searchParams.get('reservationId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, any> = {}
    if (hotelId) where.hotelId = hotelId
    if (reservationId) where.reservationId = reservationId

    const payments = await db.payment.findMany({
      where,
      include: {
        reservation: {
          include: {
            guest: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
