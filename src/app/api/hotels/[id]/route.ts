import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── GET /api/hotels/[id] ───────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hotel = await db.hotel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
            reservations: true,
          },
        },
      },
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Hotel detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

// ─── PUT /api/hotels/[id] ───────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify the hotel exists
    const existing = await db.hotel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Hotel not found.' },
        { status: 404 }
      )
    }

    // Only allow whitelisted fields
    const allowedFields: Record<string, unknown> = {}
    const whitelist = [
      'name',
      'description',
      'stars',
      'email',
      'phone',
      'city',
      'district',
      'address',
      'logoUrl',
      'coverImageUrl',
      'checkInTime',
      'checkOutTime',
      'taxRate',
      'defaultCurrency',
      'isActive',
    ]

    for (const key of whitelist) {
      if (body[key] !== undefined) {
        allowedFields[key] = body[key]
      }
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: allowedFields,
    })

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Update hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/hotels/[id] ────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.hotel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Hotel not found.' },
        { status: 404 }
      )
    }

    await db.hotel.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
