import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── GET /api/room-types/[id] ──────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const roomType = await db.roomType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Type de chambre introuvable.' },
        { status: 404 }
      )
    }

    return NextResponse.json(roomType)
  } catch (error) {
    console.error('Room type detail error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

// ─── PUT /api/room-types/[id] ──────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify the room type exists
    const existing = await db.roomType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Type de chambre introuvable.' },
        { status: 404 }
      )
    }

    // Only allow whitelisted fields
    const allowedFields: Record<string, unknown> = {}
    const whitelist = [
      'name',
      'description',
      'basePrice',
      'maxOccupancy',
      'bedCount',
      'bedType',
      'amenities',
      'isActive',
    ]

    for (const key of whitelist) {
      if (body[key] !== undefined) {
        // Amenities are stored as JSON string — stringify array input
        if (key === 'amenities' && Array.isArray(body[key])) {
          allowedFields[key] = JSON.stringify(body[key])
        } else {
          allowedFields[key] = body[key]
        }
      }
    }

    const roomType = await db.roomType.update({
      where: { id },
      data: allowedFields,
    })

    return NextResponse.json(roomType)
  } catch (error) {
    console.error('Update room type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/room-types/[id] ───────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.roomType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Type de chambre introuvable.' },
        { status: 404 }
      )
    }

    // Guard: cannot delete if rooms of this type are currently occupied
    const occupiedRooms = await db.room.count({
      where: {
        roomTypeId: id,
        status: 'occupied',
        isActive: true,
      },
    })

    if (occupiedRooms > 0) {
      return NextResponse.json(
        { error: 'Impossible de désactiver ce type de chambre car des chambres sont actuellement occupées.' },
        { status: 409 }
      )
    }

    await db.roomType.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete room type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
