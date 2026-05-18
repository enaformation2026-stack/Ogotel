import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
}

// ─── Validation Schemas ─────────────────────────────────────────────────────
const createHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  stars: z.number().int().min(1).max(5).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  defaultCurrency: z.string().optional(),
})

// ─── GET /api/hotels ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const activeParam = searchParams.get('active')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
      ]
    }

    if (activeParam !== null && activeParam !== '') {
      where.isActive = activeParam === 'true'
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
      hotels,
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
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

// ─── POST /api/hotels ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createHotelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slug = generateSlug(data.name)

    // Resolve organization — use first org found, or fallback to a demo id
    const org = await db.organization.findFirst({ orderBy: { createdAt: 'asc' } })
    const organizationId = org?.id || 'demo-org'

    // Ensure slug uniqueness within the org
    let uniqueSlug = slug
    let counter = 1
    while (
      await db.hotel.findFirst({
        where: { organizationId, slug: uniqueSlug },
      })
    ) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const hotel = await db.hotel.create({
      data: {
        organizationId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description || null,
        stars: data.stars || null,
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        district: data.district || null,
        address: data.address || null,
        checkInTime: data.checkInTime || '14:00',
        checkOutTime: data.checkOutTime || '12:00',
        taxRate: data.taxRate ?? 18.0,
        defaultCurrency: data.defaultCurrency || 'XOF',
      },
    })

    return NextResponse.json(hotel, { status: 201 })
  } catch (error) {
    console.error('Create hotel error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
