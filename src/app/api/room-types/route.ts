import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Validation Schema ─────────────────────────────────────────────────────
const createRoomTypeSchema = z.object({
  hotelId: z.string().min(1, 'L\'identifiant de l\'hôtel est requis.'),
  name: z.string().min(1, 'Le nom du type de chambre est requis.'),
  description: z.string().optional(),
  basePrice: z.number().positive('Le prix de base doit être supérieur à 0.'),
  maxOccupancy: z.number().int().min(1, 'La capacité maximale doit être d\'au moins 1.'),
  bedCount: z.number().int().min(1).optional(),
  bedType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
})

// ─── GET /api/room-types ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hotelId = searchParams.get('hotelId')
    const search = searchParams.get('search') || undefined
    const activeParam = searchParams.get('active')

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Le paramètre hotelId est requis.' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: Record<string, unknown> = { hotelId }

    if (search) {
      where.name = { contains: search }
    }

    if (activeParam !== null && activeParam !== '') {
      where.isActive = activeParam === 'true'
    }

    const roomTypes = await db.roomType.findMany({
      where,
      include: {
        _count: {
          select: {
            rooms: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ roomTypes })
  } catch (error) {
    console.error('Room types list error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

// ─── POST /api/room-types ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createRoomTypeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify the hotel exists
    const hotel = await db.hotel.findUnique({
      where: { id: data.hotelId },
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hôtel introuvable.' },
        { status: 404 }
      )
    }

    const roomType = await db.roomType.create({
      data: {
        organizationId: hotel.organizationId,
        hotelId: data.hotelId,
        name: data.name,
        description: data.description || null,
        basePrice: data.basePrice,
        maxOccupancy: data.maxOccupancy,
        bedCount: data.bedCount ?? 1,
        bedType: data.bedType || null,
        amenities: data.amenities ? JSON.stringify(data.amenities) : '[]',
        isActive: true,
      },
    })

    return NextResponse.json(roomType, { status: 201 })
  } catch (error) {
    console.error('Create room type error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
