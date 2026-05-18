import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/rooms/[id] — Update a room (status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, maintenanceNotes } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Le statut est requis' },
        { status: 400 }
      )
    }

    const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance', 'blocked']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Verify room exists
    const existingRoom = await db.room.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Chambre introuvable' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    }

    // Handle maintenance notes
    if (status === 'maintenance') {
      updateData.maintenanceNotes = maintenanceNotes || null
    } else {
      // Clear maintenance notes when leaving maintenance status
      updateData.maintenanceNotes = null
    }

    // If room becomes available, update lastCleanedAt
    if (status === 'available' && existingRoom.status !== 'available') {
      updateData.lastCleanedAt = new Date()
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
