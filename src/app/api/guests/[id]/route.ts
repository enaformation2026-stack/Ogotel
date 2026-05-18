import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateGuestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  nationality: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  idNumber: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            room: { select: { id: true, number: true } },
            hotel: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!guest || !guest.isActive) {
      return NextResponse.json(
        { error: 'Client introuvable.' },
        { status: 404 }
      )
    }

    // Compute stats
    const completedReservations = guest.reservations.filter(
      (r) => r.status === 'checked_out'
    )
    const totalSpent = completedReservations.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0
    )

    return NextResponse.json({
      data: {
        ...guest,
        stats: {
          totalReservations: guest.reservations.length,
          completedStays: completedReservations.length,
          totalSpent,
          activeReservations: guest.reservations.filter(
            (r) => ['confirmed', 'checked_in', 'pending'].includes(r.status)
          ).length,
        },
      },
    })
  } catch (error) {
    console.error('Guest detail error:', error)
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
    const parsed = updateGuestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await db.guest.findUnique({ where: { id } })
    if (!existing || !existing.isActive) {
      return NextResponse.json(
        { error: 'Client introuvable.' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { ...parsed.data }
    if (updateData.email !== undefined) {
      updateData.email = updateData.email?.toLowerCase() || null
    }
    if (updateData.tags !== undefined) {
      updateData.tags = JSON.stringify(updateData.tags)
    }

    const guest = await db.guest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: guest })
  } catch (error) {
    console.error('Update guest error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.guest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Client introuvable.' },
        { status: 404 }
      )
    }

    // Check for active reservations
    const activeReservations = await db.reservation.count({
      where: {
        guestId: id,
        status: { in: ['pending', 'confirmed', 'checked_in'] },
      },
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un client avec des réservations actives.' },
        { status: 400 }
      )
    }

    await db.guest.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Client supprimé avec succès.' })
  } catch (error) {
    console.error('Delete guest error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
