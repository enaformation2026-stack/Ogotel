import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('E-mail invalide'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  hotelName: z.string().min(1, "Nom de l'hôtel requis"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, password, hotelName } = parsed.data

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet e-mail existe déjà.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create slug from hotel name
    const hotelSlug = hotelName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create organization slug
    const orgSlug = `${hotelSlug}-org`

    // Create user, organization, hotel in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create organization
      const organization = await tx.organization.create({
        data: {
          name: `${hotelName} - Groupe`,
          slug: orgSlug,
          email: email.toLowerCase(),
          phone: phone || null,
          plan: 'trial',
          subscriptionStatus: 'active',
          maxHotels: 1,
          maxUsers: 5,
        },
      })

      // 2. Create user
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'owner',
          language: 'fr',
          isActive: true,
        },
      })

      // 3. Create organization membership
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'owner',
          isActive: true,
        },
      })

      // 4. Create hotel
      const hotel = await tx.hotel.create({
        data: {
          organizationId: organization.id,
          name: hotelName,
          slug: hotelSlug,
          email: email.toLowerCase(),
          phone: phone || null,
          checkInTime: '14:00',
          checkOutTime: '12:00',
          taxRate: 18.0,
          defaultCurrency: 'XOF',
          isActive: true,
        },
      })

      // 5. Create default room types
      const roomTypes = await Promise.all([
        tx.roomType.create({
          data: {
            organizationId: organization.id,
            hotelId: hotel.id,
            name: 'Standard',
            description: 'Chambre standard confortable',
            basePrice: 15000,
            maxOccupancy: 2,
            bedCount: 1,
            bedType: 'Double',
            amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Douche']),
          },
        }),
        tx.roomType.create({
          data: {
            organizationId: organization.id,
            hotelId: hotel.id,
            name: 'Supérieure',
            description: 'Chambre supérieure avec vue',
            basePrice: 25000,
            maxOccupancy: 2,
            bedCount: 1,
            bedType: 'Queen',
            amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Salle de bain', 'Minibar']),
          },
        }),
        tx.roomType.create({
          data: {
            organizationId: organization.id,
            hotelId: hotel.id,
            name: 'Suite',
            description: 'Suite luxueuse avec salon séparé',
            basePrice: 50000,
            maxOccupancy: 4,
            bedCount: 1,
            bedType: 'King',
            amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Salle de bain', 'Minibar', 'Salon', 'Terrasse']),
          },
        }),
      ])

      // 6. Create default rooms (5 Standard, 3 Supérieure, 1 Suite)
      const rooms = await Promise.all([
        ...roomTypes[0] ? Array.from({ length: 5 }).map((_, i) =>
          tx.room.create({
            data: {
              organizationId: organization.id,
              hotelId: hotel.id,
              roomTypeId: roomTypes[0].id,
              number: `1${i + 1}`.padStart(2, '0'),
              floor: '1',
              status: 'available',
            },
          })
        ) : [],
        ...roomTypes[1] ? Array.from({ length: 3 }).map((_, i) =>
          tx.room.create({
            data: {
              organizationId: organization.id,
              hotelId: hotel.id,
              roomTypeId: roomTypes[1].id,
              number: `2${i + 1}`.padStart(2, '0'),
              floor: '2',
              status: 'available',
            },
          })
        ) : [],
        ...roomTypes[2] ? Array.from({ length: 1 }).map((_, i) =>
          tx.room.create({
            data: {
              organizationId: organization.id,
              hotelId: hotel.id,
              roomTypeId: roomTypes[2].id,
              number: `3${i + 1}`.padStart(2, '0'),
              floor: '3',
              status: 'available',
            },
          })
        ) : [],
      ])

      return { user, organization, hotel, roomTypes, rooms }
    })

    return NextResponse.json({
      user: {
        id: result.user.id,
        organizationId: result.organization.id,
        firstName,
        lastName,
        email: result.user.email,
        role: result.user.role,
        language: result.user.language,
        isActive: result.user.isActive,
      },
      hotel: {
        id: result.hotel.id,
        name: result.hotel.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
