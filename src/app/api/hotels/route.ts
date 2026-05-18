import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createHotelSchema = z.object({
  organizationId: z.string().min(1, 'Organisation requise'),
  name: z.string().min(1, 'Nom de l\'hôtel requis'),
  slug: z.string().min(1, 'Slug requis'),
  description: z.string().optional(),
  stars: z.number().int().min(1).max(5).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('12:00'),
  taxRate: z.number().min(0).max(100).default(18.0),
  defaultCurrency: z.string().default('XOF'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const where: Record<string, unknown> = { isActive: true }

    if (organizationId) where.organizationId = organizationId
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        include: {
          _count: {
            select: {
              rooms: { where: { isActive: true } },
              roomTypes: { where: { isActive: true } },
              reservations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.hotel.count({ where }),
    ])

    return NextResponse.json({
      data: hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Hotels list error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createHotelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check organization exists
    const org = await db.organization.findUnique({
      where: { id: data.organizationId },
    })
    if (!org) {
      return NextResponse.json(
        { error: 'Organisation introuvable.' },
        { status: 404 }
      )
    }

    // Check max hotels limit
    const currentHotels = await db.hotel.count({
      where: { organizationId: data.organizationId, isActive: true },
    })
    if (currentHotels >= org.maxHotels) {
      return NextResponse.json(
        { error: `Limite de ${org.maxHotels} hôtel(s) atteinte pour votre abonnement.` },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existingSlug = await db.hotel.findFirst({
      where: { organizationId: data.organizationId, slug: data.slug },
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà pour cet hôtel.' },
        { status: 409 }
      )
    }

    const hotel = await db.hotel.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        stars: data.stars || null,
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        district: data.district || null,
        address: data.address || null,
        logoUrl: data.logoUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        taxRate: data.taxRate,
        defaultCurrency: data.defaultCurrency,
      },
      include: {
        _count: {
          select: {
            rooms: { where: { isActive: true } },
            roomTypes: { where: { isActive: true } },
          },
        },
      },
    })

    return NextResponse.json({ data: hotel }, { status: 201 })
  } catch (error) {
    console.error('Create hotel error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
