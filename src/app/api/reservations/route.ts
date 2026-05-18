import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/reservations — Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      roomRate,
      nights,
      totalAmount,
      specialRequests,
      notes,
      source = 'direct',
      isWalkIn = false,
    } = body

    // Validate required fields
    if (!guestId || !checkInDate || !checkOutDate || !nights || !totalAmount) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Verify guest exists
    const guest = await db.guest.findUnique({ where: { id: guestId } })
    if (!guest) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
      )
    }

    // Verify room exists and is available (if roomId provided)
    if (roomId) {
      const room = await db.room.findUnique({ where: { id: roomId } })
      if (!room) {
        return NextResponse.json(
          { error: 'Chambre introuvable' },
          { status: 404 }
        )
      }
    }

    // Use the first hotel of the guest's org as hotelId
    const hotel = await db.hotel.findFirst({
      where: { organizationId: guest.organizationId },
    })
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hôtel introuvable' },
        { status: 404 }
      )
    }

    // Generate reference
    const count = await db.reservation.count()
    const reference = `RES-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    // Use the first user of the org as createdById
    const member = await db.organizationMember.findFirst({
      where: { organizationId: guest.organizationId },
      include: { user: true },
    })
    const createdById = member?.userId ?? ''

    // Create reservation
    const reservation = await db.reservation.create({
      data: {
        organizationId: guest.organizationId,
        hotelId: hotel.id,
        roomId: roomId || null,
        guestId,
        reference,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        nights: Number(nights),
        adults: Number(adults),
        children: Number(children),
        roomRate: Number(roomRate || 0),
        subtotal: Number(totalAmount),
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: Number(totalAmount),
        paidAmount: 0,
        balanceDue: Number(totalAmount),
        status: 'pending',
        specialRequests: specialRequests || null,
        notes: notes || null,
        source,
        isWalkIn,
        createdById,
      },
      include: {
        guest: true,
        room: { include: { roomType: true } },
      },
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/reservations — List reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, any> = {}
    if (hotelId) where.hotelId = hotelId
    if (status) where.status = status

    const reservations = await db.reservation.findMany({
      where,
      include: {
        guest: true,
        room: { include: { roomType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(reservations)
  } catch (error: any) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
