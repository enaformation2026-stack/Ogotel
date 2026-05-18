import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateReservationSchema = z.object({
  roomId: z.string().nullable().optional(),
  guestId: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  roomRate: z.number().positive().optional(),
  discountAmount: z.number().min(0).optional(),
  specialRequests: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: z.enum(['direct', 'booking.com', 'walk_in', 'phone', 'email', 'website']).optional(),
})

const statusTransitionSchema = z.object({
  action: z.enum(['confirm', 'check_in', 'check_out', 'cancel', 'no_show']),
  roomId: z.string().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        room: { include: { roomType: true, hotel: { select: { id: true, name: true } } } },
        guest: true,
        hotel: true,
        createdBy: { select: { id: true, name: true, email: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: reservation })
  } catch (error) {
    console.error('Reservation detail error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Check if this is a status transition
    if (body.action) {
      const parsed = statusTransitionSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0].message },
          { status: 400 }
        )
      }

      const reservation = await db.reservation.findUnique({ where: { id } })
      if (!reservation) {
        return NextResponse.json(
          { error: 'Réservation introuvable.' },
          { status: 404 }
        )
      }

      const { action, roomId } = parsed.data

      const result = await db.$transaction(async (tx) => {
        let updatedReservation

        switch (action) {
          case 'confirm': {
            if (reservation.status !== 'pending') {
              throw new Error('Seule une réservation en attente peut être confirmée.')
            }
            updatedReservation = await tx.reservation.update({
              where: { id },
              data: { status: 'confirmed' },
              include: {
                room: { include: { roomType: true } },
                guest: true,
                hotel: { select: { id: true, name: true } },
                payments: true,
              },
            })
            break
          }

          case 'check_in': {
            if (!['confirmed', 'pending'].includes(reservation.status)) {
              throw new Error('Impossible de faire le check-in pour cette réservation.')
            }

            // Assign room if provided
            const targetRoomId = roomId || reservation.roomId
            if (targetRoomId) {
              // Check room availability
              const conflicting = await tx.reservation.findFirst({
                where: {
                  roomId: targetRoomId,
                  status: { in: ['confirmed', 'checked_in'] },
                  id: { not: id },
                  checkInDate: { lt: reservation.checkOutDate },
                  checkOutDate: { gt: reservation.checkInDate },
                },
              })
              if (conflicting) {
                throw new Error('Cette chambre est déjà occupée pour ces dates.')
              }

              // Mark room as occupied
              await tx.room.update({
                where: { id: targetRoomId },
                data: { status: 'occupied' },
              })
            }

            updatedReservation = await tx.reservation.update({
              where: { id },
              data: {
                status: 'checked_in',
                actualCheckIn: new Date(),
                ...(targetRoomId && targetRoomId !== reservation.roomId ? { roomId: targetRoomId } : {}),
              },
              include: {
                room: { include: { roomType: true } },
                guest: true,
                hotel: { select: { id: true, name: true } },
                payments: true,
              },
            })
            break
          }

          case 'check_out': {
            if (reservation.status !== 'checked_in') {
              throw new Error('Impossible de faire le check-out: la réservation n\'est pas en cours.')
            }

            // Free up the room
            if (reservation.roomId) {
              await tx.room.update({
                where: { id: reservation.roomId },
                data: { status: 'cleaning' },
              })
            }

            updatedReservation = await tx.reservation.update({
              where: { id },
              data: {
                status: 'checked_out',
                actualCheckOut: new Date(),
              },
              include: {
                room: { include: { roomType: true } },
                guest: true,
                hotel: { select: { id: true, name: true } },
                payments: true,
              },
            })

            // Update guest stats
            await tx.guest.update({
              where: { id: reservation.guestId },
              data: {
                totalStays: { increment: 1 },
                totalSpent: { increment: reservation.totalAmount },
                lastStayAt: new Date(),
              },
            })
            break
          }

          case 'cancel': {
            if (['checked_out', 'cancelled'].includes(reservation.status)) {
              throw new Error('Impossible d\'annuler cette réservation.')
            }

            // Free up the room if it was checked in
            if (reservation.status === 'checked_in' && reservation.roomId) {
              await tx.room.update({
                where: { id: reservation.roomId },
                data: { status: 'available' },
              })
            }

            updatedReservation = await tx.reservation.update({
              where: { id },
              data: { status: 'cancelled' },
              include: {
                room: { include: { roomType: true } },
                guest: true,
                hotel: { select: { id: true, name: true } },
                payments: true,
              },
            })
            break
          }

          case 'no_show': {
            if (!['confirmed', 'pending'].includes(reservation.status)) {
              throw new Error('Impossible de marquer comme no-show.')
            }
            updatedReservation = await tx.reservation.update({
              where: { id },
              data: { status: 'no_show' },
              include: {
                room: { include: { roomType: true } },
                guest: true,
                hotel: { select: { id: true, name: true } },
                payments: true,
              },
            })
            break
          }

          default:
            throw new Error('Action non reconnue.')
        }

        return updatedReservation
      })

      return NextResponse.json({ data: result })
    }

    // Regular update
    const parsed = updateReservationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const reservation = await db.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.checkInDate) updateData.checkInDate = new Date(parsed.data.checkInDate)
    if (parsed.data.checkOutDate) updateData.checkOutDate = new Date(parsed.data.checkOutDate)
    if (parsed.data.adults !== undefined) updateData.adults = parsed.data.adults
    if (parsed.data.children !== undefined) updateData.children = parsed.data.children
    if (parsed.data.roomRate !== undefined) updateData.roomRate = parsed.data.roomRate
    if (parsed.data.discountAmount !== undefined) updateData.discountAmount = parsed.data.discountAmount
    if (parsed.data.specialRequests !== undefined) updateData.specialRequests = parsed.data.specialRequests
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes
    if (parsed.data.source !== undefined) updateData.source = parsed.data.source
    if (parsed.data.roomId !== undefined) updateData.roomId = parsed.data.roomId
    if (parsed.data.guestId !== undefined) updateData.guestId = parsed.data.guestId

    // Recalculate nights if dates changed
    const newCheckIn = updateData.checkInDate
      ? new Date(updateData.checkInDate as Date)
      : reservation.checkInDate
    const newCheckOut = updateData.checkOutDate
      ? new Date(updateData.checkOutDate as Date)
      : reservation.checkOutDate
    const newNights = Math.ceil(
      (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (newNights > 0) {
      updateData.nights = newNights
      const subtotal = (parsed.data.roomRate ?? reservation.roomRate) * newNights
      updateData.subtotal = subtotal
      updateData.totalAmount = subtotal + (reservation.taxAmount || 0) - (parsed.data.discountAmount ?? reservation.discountAmount || 0)
      updateData.balanceDue = updateData.totalAmount - reservation.paidAmount
    }

    const updated = await db.reservation.update({
      where: { id },
      data: updateData,
      include: {
        room: { include: { roomType: true } },
        guest: true,
        hotel: { select: { id: true, name: true } },
        payments: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update reservation error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur.'
    const status = error instanceof Error && error.message.includes('Impossible')
      ? 400
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservation = await db.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      )
    }

    if (['checked_in', 'checked_out'].includes(reservation.status)) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une réservation en cours ou terminée.' },
        { status: 400 }
      )
    }

    await db.reservation.delete({ where: { id } })

    return NextResponse.json({ message: 'Réservation supprimée avec succès.' })
  } catch (error) {
    console.error('Delete reservation error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
