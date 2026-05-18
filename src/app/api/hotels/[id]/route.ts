import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateHotelSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  stars: z.number().int().min(1).max(5).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  defaultCurrency: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hotel = await db.hotel.findUnique({
      where: { id },
      include: {
        roomTypes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                rooms: { where: { isActive: true } },
              },
            },
          },
        },
        _count: {
          select: {
            rooms: { where: { isActive: true } },
            reservations: true,
            payments: true,
          },
        },
      },
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hôtel introuvable.' },
        { status: 404 }
      )
    }

    // Compute room status breakdown
    const roomStats = await db.room.groupBy({
      by: ['status'],
      where: { hotelId: id, isActive: true },
      _count: { status: true },
    })

    const statusCounts: Record<string, number> = {}
    for (const rs of roomStats) {
      statusCounts[rs.status] = rs._count.status
    }

    // Compute revenue stats
    const revenueData = await db.payment.aggregate({
      where: { hotelId: id, status: 'completed' },
      _sum: { amount: true },
    })

    const totalRevenue = revenueData._sum.amount || 0

    // Active reservations count
    const activeReservations = await db.reservation.count({
      where: {
        hotelId: id,
        status: { in: ['confirmed', 'checked_in'] },
      },
    })

    // Today's check-ins and check-outs
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayCheckIns, todayCheckOuts] = await Promise.all([
      db.reservation.count({
        where: {
          hotelId: id,
          checkInDate: { gte: today, lt: tomorrow },
          status: { in: ['confirmed', 'pending'] },
        },
      }),
      db.reservation.count({
        where: {
          hotelId: id,
          checkOutDate: { gte: today, lt: tomorrow },
          status: 'checked_in',
        },
      }),
    ])

    // Occupancy rate
    const totalRooms = hotel._count.rooms
    const occupiedRooms = statusCounts['occupied'] || 0
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return NextResponse.json({
      data: {
        ...hotel,
        stats: {
          totalRooms,
          roomStatusCounts: statusCounts,
          totalRevenue,
          activeReservations,
          todayCheckIns,
          todayCheckOuts,
          occupancyRate,
        },
      },
    })
  } catch (error) {
    console.error('Hotel detail error:', error)
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
    const parsed = updateHotelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await db.hotel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Hôtel introuvable.' },
        { status: 404 }
      )
    }

    // Check slug uniqueness if changing
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await db.hotel.findFirst({
        where: { organizationId: existing.organizationId, slug: parsed.data.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ce slug existe déjà.' },
          { status: 409 }
        )
      }
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: {
            rooms: { where: { isActive: true } },
            roomTypes: { where: { isActive: true } },
          },
        },
      },
    })

    return NextResponse.json({ data: hotel })
  } catch (error) {
    console.error('Update hotel error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
