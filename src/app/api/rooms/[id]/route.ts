import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Allowed fields for PATCH updates
const ALLOWED_FIELDS = new Set([
  'status',
  'maintenanceNotes',
  'number',
  'floor',
  'name',
  'roomTypeId',
  'priceOverride',
  'isActive',
])

const VALID_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance', 'blocked']

// GET /api/rooms/[id] — Get a single room with roomType
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const room = await db.room.findUnique({
      where: { id },
      include: {
        roomType: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chambre introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error: any) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH /api/rooms/[id] — Update a room (multiple fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verify room exists
    const existingRoom = await db.room.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Chambre introuvable' },
        { status: 404 }
      )
    }

    // Build update data — only include allowed fields that are present in the body
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) continue

      if (key === 'status') {
        if (typeof value !== 'string' || !VALID_STATUSES.includes(value)) {
          return NextResponse.json(
            { error: 'Statut invalide' },
            { status: 400 }
          )
        }
        updateData.status = value

        // Handle maintenance notes when status changes
        if (value === 'maintenance') {
          // Keep provided maintenanceNotes or preserve existing
          if (body.maintenanceNotes !== undefined) {
            updateData.maintenanceNotes = body.maintenanceNotes || null
          }
        } else {
          // Clear maintenance notes when leaving maintenance status
          updateData.maintenanceNotes = null
        }

        // If room becomes available, update lastCleanedAt
        if (value === 'available' && existingRoom.status !== 'available') {
          updateData.lastCleanedAt = new Date()
        }
      } else if (key === 'maintenanceNotes' && body.status !== 'maintenance') {
        // Only set maintenanceNotes if not already handled by status above
        if (existingRoom.status === 'maintenance') {
          updateData.maintenanceNotes = value || null
        }
      } else if (key === 'number') {
        if (typeof value !== 'string' || !value.trim()) {
          return NextResponse.json(
            { error: 'Le numéro de chambre est requis' },
            { status: 400 }
          )
        }
        // Check uniqueness within hotel (exclude current room)
        const duplicate = await db.room.findFirst({
          where: {
            hotelId: existingRoom.hotelId,
            number: value.trim(),
            id: { not: id },
          },
        })
        if (duplicate) {
          return NextResponse.json(
            { error: 'Une chambre avec ce numéro existe déjà dans cet hôtel' },
            { status: 409 }
          )
        }
        updateData.number = value.trim()
      } else if (key === 'roomTypeId') {
        if (typeof value !== 'string') {
          return NextResponse.json(
            { error: 'Type de chambre invalide' },
            { status: 400 }
          )
        }
        // Verify room type exists
        const roomType = await db.roomType.findUnique({ where: { id: value } })
        if (!roomType) {
          return NextResponse.json(
            { error: 'Type de chambre introuvable' },
            { status: 404 }
          )
        }
        updateData.roomTypeId = value
      } else if (key === 'priceOverride') {
        updateData.priceOverride = value !== null && value !== undefined ? Number(value) : null
      } else if (key === 'isActive') {
        updateData.isActive = Boolean(value)
      } else if (key === 'floor') {
        updateData.floor = value || null
      } else if (key === 'name') {
        updateData.name = value || null
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length <= 1) {
      // Only updatedAt was added — no actual changes
      return NextResponse.json(existingRoom)
    }

    // Update room
    const room = await db.room.update({
      where: { id },
      data: updateData,
      include: {
        roomType: true,
      },
    })

    return NextResponse.json(room)
  } catch (error: any) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/[id] — Soft delete a room (set isActive=false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['checked_in', 'confirmed'] },
          },
        },
      },
    })
    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Chambre introuvable' },
        { status: 404 }
      )
    }

    // Guard: cannot delete if room has active reservations
    if (existingRoom.reservations.length > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer cette chambre : ${existingRoom.reservations.length} réservation(s) active(s) en cours`,
        },
        { status: 409 }
      )
    }

    // Soft delete
    await db.room.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
