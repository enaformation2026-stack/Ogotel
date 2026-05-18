import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/guests — Create a new guest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      nationality,
      country,
      city,
      idNumber,
      tags = [],
    } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'Le prénom et le nom sont requis' },
        { status: 400 }
      )
    }

    // Get first organization (for demo purposes)
    const organization = await db.organization.findFirst()
    if (!organization) {
      return NextResponse.json(
        { error: 'Organisation introuvable' },
        { status: 404 }
      )
    }

    // Check for duplicate email
    if (email?.trim()) {
      const existingGuest = await db.guest.findFirst({
        where: {
          organizationId: organization.id,
          email: email.trim(),
        },
      })
      if (existingGuest) {
        return NextResponse.json(
          { error: 'Un client avec cet email existe déjà' },
          { status: 409 }
        )
      }
    }

    // Create guest
    const guest = await db.guest.create({
      data: {
        organizationId: organization.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        nationality: nationality || null,
        country: country || null,
        city: city?.trim() || null,
        idNumber: idNumber?.trim() || null,
        tags: JSON.stringify(tags),
      },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error: any) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/guests — List guests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, any> = {}
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const guests = await db.guest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(guests)
  } catch (error: any) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
