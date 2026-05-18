import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding OGOTEL CLOUD database...')

  // 1. Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'ogotel-demo' },
    update: {},
    create: {
      name: 'OGOTEL Demo - Groupe Konan',
      slug: 'ogotel-demo',
      email: 'contact@ogotel-demo.ci',
      phone: '+225 07 08 09 10 11',
      country: 'CI',
      city: 'Abidjan',
      plan: 'pro',
      subscriptionStatus: 'active',
      maxHotels: 5,
      maxUsers: 20,
      currency: 'XOF',
    },
  })
  console.log(`✅ Organization: ${organization.name}`)

  // 2. Create demo users
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const owner = await prisma.user.upsert({
    where: { email: 'mamadou@hotel-cocody.ci' },
    update: {},
    create: {
      name: 'Mamadou Konan',
      email: 'mamadou@hotel-cocody.ci',
      password: hashedPassword,
      role: 'owner',
      language: 'fr',
      isActive: true,
    },
  })
  console.log(`✅ User (owner): ${owner.email}`)

  const manager = await prisma.user.upsert({
    where: { email: 'aminata@hotel-cocody.ci' },
    update: {},
    create: {
      name: 'Aminata Diallo',
      email: 'aminata@hotel-cocody.ci',
      password: hashedPassword,
      role: 'manager',
      language: 'fr',
      isActive: true,
    },
  })
  console.log(`✅ User (manager): ${manager.email}`)

  const receptionist = await prisma.user.upsert({
    where: { email: 'fatou@hotel-cocody.ci' },
    update: {},
    create: {
      name: 'Fatou Bamba',
      email: 'fatou@hotel-cocody.ci',
      password: hashedPassword,
      role: 'receptionist',
      language: 'fr',
      isActive: true,
    },
  })
  console.log(`✅ User (receptionist): ${receptionist.email}`)

  const accountant = await prisma.user.upsert({
    where: { email: 'kouadio@hotel-cocody.ci' },
    update: {},
    create: {
      name: 'Kouadio Yao',
      email: 'kouadio@hotel-cocody.ci',
      password: hashedPassword,
      role: 'accountant',
      language: 'fr',
      isActive: true,
    },
  })
  console.log(`✅ User (accountant): ${accountant.email}`)

  // 3. Add users to organization
  for (const [user, role] of [
    [owner, 'owner'],
    [manager, 'admin'],
    [receptionist, 'member'],
    [accountant, 'member'],
  ] as const) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        userId: user.id,
        role,
        isActive: true,
      },
    })
  }
  console.log('✅ Organization members added')

  // 4. Create hotels
  const hotel1 = await prisma.hotel.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'hotel-cocody-palace',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Hôtel Cocody Palace',
      slug: 'hotel-cocody-palace',
      description: 'Hôtel 4 étoiles dans le quartier huppé de Cocody',
      stars: 4,
      email: 'info@cocody-palace.ci',
      phone: '+225 07 08 09 10 11',
      city: 'Abidjan',
      district: 'Cocody',
      address: 'Rue des Ambassades, Cocody',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      taxRate: 18.0,
      defaultCurrency: 'XOF',
      isActive: true,
    },
  })
  console.log(`✅ Hotel: ${hotel1.name}`)

  const hotel2 = await prisma.hotel.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'hotel-plateau-business',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Hôtel Plateau Business',
      slug: 'hotel-plateau-business',
      description: 'Hôtel d\'affaires au cœur du Plateau',
      stars: 3,
      email: 'info@plateau-business.ci',
      phone: '+225 05 06 07 08 09',
      city: 'Abidjan',
      district: 'Plateau',
      address: 'Boulevard VGE, Plateau',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      taxRate: 18.0,
      defaultCurrency: 'XOF',
      isActive: true,
    },
  })
  console.log(`✅ Hotel: ${hotel2.name}`)

  const hotel3 = await prisma.hotel.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'hotel-marcory-lodge',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Hôtel Marcory Lodge',
      slug: 'hotel-marcory-lodge',
      description: 'Hôtel économique et convivial à Marcory',
      stars: 2,
      email: 'info@marcory-lodge.ci',
      phone: '+225 01 02 03 04 05',
      city: 'Abidjan',
      district: 'Marcory',
      address: 'Boulevard de Marseille, Marcory',
      checkInTime: '15:00',
      checkOutTime: '12:00',
      taxRate: 18.0,
      defaultCurrency: 'XOF',
      isActive: true,
    },
  })
  console.log(`✅ Hotel: ${hotel3.name}`)

  // 5. Create room types for each hotel
  for (const hotel of [hotel1, hotel2, hotel3]) {
    const types = [
      {
        name: 'Standard',
        description: 'Chambre standard confortable',
        basePrice: hotel === hotel1 ? 25000 : hotel === hotel2 ? 18000 : 10000,
        maxOccupancy: 2,
        bedCount: 1,
        bedType: 'Double',
        amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Douche']),
      },
      {
        name: 'Supérieure',
        description: 'Chambre supérieure avec vue',
        basePrice: hotel === hotel1 ? 45000 : hotel === hotel2 ? 30000 : 18000,
        maxOccupancy: 2,
        bedCount: 1,
        bedType: 'Queen',
        amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Salle de bain', 'Minibar']),
      },
      {
        name: 'Suite',
        description: 'Suite luxueuse avec salon séparé',
        basePrice: hotel === hotel1 ? 85000 : hotel === hotel2 ? 55000 : 30000,
        maxOccupancy: 4,
        bedCount: 1,
        bedType: 'King',
        amenities: JSON.stringify(['WiFi', 'TV', 'Climatisation', 'Salle de bain', 'Minibar', 'Salon', 'Terrasse']),
      },
    ]

    for (const type of types) {
      const roomType = await prisma.roomType.upsert({
        where: { id: `${hotel.id}-${type.name.toLowerCase()}` },
        update: {},
        create: {
          id: `${hotel.id}-${type.name.toLowerCase()}`,
          organizationId: organization.id,
          hotelId: hotel.id,
          ...type,
        },
      })
      console.log(`  ✅ Room type: ${roomType.name} (${hotel.name})`)
    }
  }

  // 6. Create rooms for hotel1 (9 rooms)
  const hotel1Types = await prisma.roomType.findMany({
    where: { hotelId: hotel1.id },
  })

  let roomCount = 0
  if (hotel1Types[0]) { // Standard
    for (let i = 1; i <= 5; i++) {
      const roomNum = `1${i}`.padStart(2, '0')
      await prisma.room.upsert({
        where: { hotelId_number: { hotelId: hotel1.id, number: roomNum } },
        update: {},
        create: {
          organizationId: organization.id,
          hotelId: hotel1.id,
          roomTypeId: hotel1Types[0].id,
          number: roomNum,
          floor: '1',
          status: i <= 2 ? 'available' : i <= 4 ? 'occupied' : 'cleaning',
        },
      })
      roomCount++
    }
  }
  if (hotel1Types[1]) { // Supérieure
    for (let i = 1; i <= 3; i++) {
      const roomNum = `2${i}`.padStart(2, '0')
      await prisma.room.upsert({
        where: { hotelId_number: { hotelId: hotel1.id, number: roomNum } },
        update: {},
        create: {
          organizationId: organization.id,
          hotelId: hotel1.id,
          roomTypeId: hotel1Types[1].id,
          number: roomNum,
          floor: '2',
          status: i === 1 ? 'occupied' : i === 2 ? 'available' : 'maintenance',
        },
      })
      roomCount++
    }
  }
  if (hotel1Types[2]) { // Suite
    const roomNum = '301'
    await prisma.room.upsert({
      where: { hotelId_number: { hotelId: hotel1.id, number: roomNum } },
      update: {},
      create: {
        organizationId: organization.id,
        hotelId: hotel1.id,
        roomTypeId: hotel1Types[2].id,
        number: roomNum,
        floor: '3',
        status: 'occupied',
      },
    })
    roomCount++
  }
  console.log(`✅ Created ${roomCount} rooms for ${hotel1.name}`)

  // 7. Create demo guests
  const guests = [
    { firstName: 'Jean-Baptiste', lastName: 'Traoré', email: 'jb.traore@email.com', phone: '+225 01 11 22 33 44', nationality: 'Ivoirienne', country: 'CI', city: 'Abidjan', tags: '["VIP"]' },
    { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@email.com', phone: '+33 6 12 34 56 78', nationality: 'Française', country: 'FR', city: 'Paris', tags: '[]' },
    { firstName: 'Ibrahim', lastName: 'Sow', email: 'i.sow@email.com', phone: '+221 77 123 45 67', nationality: 'Sénégalaise', country: 'SN', city: 'Dakar', tags: '["Corporate"]' },
    { firstName: 'Aïcha', lastName: 'Ouattara', email: 'aicha.ouattara@email.com', phone: '+225 07 98 76 54 32', nationality: 'Ivoirienne', country: 'CI', city: 'Bouaké', tags: '["VIP","Corporate"]' },
    { firstName: 'Kofi', lastName: 'Mensah', email: 'kofi.mensah@email.com', phone: '+233 24 567 8901', nationality: 'Ghanéenne', country: 'GH', city: 'Accra', tags: '[]' },
  ]

  const createdGuests = []
  for (const g of guests) {
    const guest = await prisma.guest.upsert({
      where: { id: `${organization.id}-${g.email}` },
      update: {},
      create: {
        id: `${organization.id}-${g.email}`,
        organizationId: organization.id,
        ...g,
        totalStays: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 500000) + 50000,
        lastStayAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
    createdGuests.push(guest)
    console.log(`✅ Guest: ${guest.firstName} ${guest.lastName}`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Demo credentials:')
  console.log('  Owner:         mamadou@hotel-cocody.ci / demo1234')
  console.log('  Manager:       aminata@hotel-cocody.ci / demo1234')
  console.log('  Receptionist:  fatou@hotel-cocody.ci / demo1234')
  console.log('  Accountant:    kouadio@hotel-cocody.ci / demo1234')
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
