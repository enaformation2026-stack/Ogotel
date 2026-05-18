import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/rooms — Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      hotelId,
      number,
      floor,
      roomTypeId,
      name,
      initialStatus = 'available',
    } = body

    // Validate required fields
    if (!hotelId || !number?.trim() || !roomTypeId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Verify hotel exists
    const hotel = await db.hotel.findUnique({ where: { id: hotelId } })
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hôtel introuvable' },
        { status: 404 }
      )
    }

    // Verify room type exists
    const roomType = await db.roomType.findUnique({ where: { id: roomTypeId } })
    if (!roomType) {
      return NextResponse.json(
        { error: 'Type de chambre introuvable' },
        { status: 404 }
      )
    }

    // Check for duplicate room number
    const existingRoom = await db.room.findFirst({
      where: {
        hotelId,
        number: number.trim(),
      },
    })
    if (existingRoom) {
      return NextResponse.json(
        { error: 'Une chambre avec ce numéro existe déjà' },
        { status: 409 }
      )
    }

    // Create room
    const room = await db.room.create({
      data: {
        organizationId: hotel.organizationId,
        hotelId,
        roomTypeId,
        number: number.trim(),
        floor: floor?.trim() || null,
        name: name?.trim() || null,
        status: initialStatus,
        isActive: true,
      },
      include: {
        roomType: true,
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/rooms — List rooms (optionally with room types)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: Record<string, any> = {}
    if (hotelId) where.hotelId = hotelId
    if (status) where.status = status

    const rooms = await db.room.findMany({
      where,
      include: {
        roomType: true,
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      take: limit,
    })

    // If roomTypes query param is set, also return room types
    const includeRoomTypes = searchParams.get('roomTypes') === 'true'
    let roomTypes: any[] = []
    if (includeRoomTypes && hotelId) {
      roomTypes = await db.roomType.findMany({
        where: { hotelId },
      })
    }

    return NextResponse.json({
      rooms,
      ...(includeRoomTypes ? { roomTypes } : {}),
    })
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
