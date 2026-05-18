import type {
  Hotel,
  RoomType,
  Room,
  Guest,
  Reservation,
  Payment,
  DashboardKPIs,
  RevenueDataPoint,
  PaymentMethodBreakdown,
} from '@/types';

// ==========================================
// HÔTELS MOCK
// ==========================================
export const MOCK_HOTELS: Hotel[] = [
  {
    id: 'hotel-001',
    organizationId: 'org-001',
    name: 'Hôtel Le Cocody',
    slug: 'hotel-cocody',
    description: 'Hôtel 3 étoiles au cœur de Cocody',
    stars: 3,
    email: 'contact@hotel-cocody.ci',
    phone: '+225 27 20 30 40 50',
    city: 'Abidjan',
    district: 'Cocody',
    address: 'Rue des Ambassades, Cocody',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    taxRate: 0,
    defaultCurrency: 'FCFA',
    isActive: true,
  },
  {
    id: 'hotel-002',
    organizationId: 'org-001',
    name: 'Résidence Plateau',
    slug: 'residence-plateau',
    description: 'Appartements meublés au Plateau',
    stars: 2,
    email: 'info@residence-plateau.ci',
    phone: '+225 27 21 31 41 51',
    city: 'Abidjan',
    district: 'Plateau',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    taxRate: 0,
    defaultCurrency: 'FCFA',
    isActive: true,
  },
];

// ==========================================
// TYPES DE CHAMBRES MOCK
// ==========================================
export const MOCK_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-001',
    organizationId: 'org-001',
    hotelId: 'hotel-001',
    name: 'Standard',
    description: 'Chambre confortable avec vue jardin',
    basePrice: 25000,
    maxOccupancy: 2,
    bedCount: 1,
    bedType: 'Queen',
    amenities: ['wifi', 'ac', 'tv', 'minibar'],
    images: [],
  },
  {
    id: 'rt-002',
    organizationId: 'org-001',
    hotelId: 'hotel-001',
    name: 'Deluxe',
    description: 'Chambre spacieuse avec balcon',
    basePrice: 45000,
    maxOccupancy: 2,
    bedCount: 1,
    bedType: 'King',
    amenities: ['wifi', 'ac', 'tv', 'minibar', 'safe', 'balcon'],
    images: [],
  },
  {
    id: 'rt-003',
    organizationId: 'org-001',
    hotelId: 'hotel-001',
    name: 'Suite Junior',
    description: 'Suite avec salon séparé',
    basePrice: 65000,
    maxOccupancy: 3,
    bedCount: 1,
    bedType: 'King',
    amenities: ['wifi', 'ac', 'tv', 'minibar', 'safe', 'balcon', 'baignoire'],
    images: [],
  },
  {
    id: 'rt-004',
    organizationId: 'org-001',
    hotelId: 'hotel-001',
    name: 'Suite Royale',
    description: 'La meilleure suite de l\'hôtel',
    basePrice: 120000,
    maxOccupancy: 4,
    bedCount: 1,
    bedType: 'King',
    amenities: ['wifi', 'ac', 'tv', 'minibar', 'safe', 'balcon', 'baignoire', 'vue-mer'],
    images: [],
  },
];

// ==========================================
// CHAMBRES MOCK
// ==========================================
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);

export const MOCK_ROOMS: Room[] = [
  // Étage RDC
  { id: 'rm-001', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '101', floor: 'RDC', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[0] },
  { id: 'rm-002', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '102', floor: 'RDC', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
  { id: 'rm-003', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '103', floor: 'RDC', status: 'cleaning', isActive: true, roomType: MOCK_ROOM_TYPES[0] },
  { id: 'rm-004', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '104', floor: 'RDC', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
  { id: 'rm-005', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '105', floor: 'RDC', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[0] },
  { id: 'rm-006', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '106', floor: 'RDC', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[0] },
  // Étage 1
  { id: 'rm-007', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '201', floor: '1er', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[2] },
  { id: 'rm-008', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '202', floor: '1er', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
  { id: 'rm-009', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '203', floor: '1er', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[2] },
  { id: 'rm-010', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '204', floor: '1er', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
  { id: 'rm-011', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '205', floor: '1er', status: 'maintenance', isActive: true, maintenanceNotes: 'Climatisation en panne', roomType: MOCK_ROOM_TYPES[0] },
  { id: 'rm-012', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '206', floor: '1er', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[0] },
  // Étage 2
  { id: 'rm-013', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-004', number: '301', floor: '2ème', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[3] },
  { id: 'rm-014', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '302', floor: '2ème', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[2] },
  { id: 'rm-015', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-004', number: '303', floor: '2ème', status: 'occupied', isActive: true, roomType: MOCK_ROOM_TYPES[3] },
  { id: 'rm-016', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '304', floor: '2ème', status: 'cleaning', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
  { id: 'rm-017', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '305', floor: '2ème', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[2] },
  { id: 'rm-018', organizationId: 'org-001', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '306', floor: '2ème', status: 'available', isActive: true, roomType: MOCK_ROOM_TYPES[1] },
];

// ==========================================
// CLIENTS MOCK
// ==========================================
export const MOCK_GUESTS: Guest[] = [
  { id: 'gst-001', organizationId: 'org-001', firstName: 'Aminata', lastName: 'Koné', email: 'aminata.kone@email.com', phone: '+225 05 01 02 03', gender: 'female', nationality: 'Ivoirienne', country: "Côte d'Ivoire", city: 'Abidjan', totalStays: 8, totalSpent: 960000, lastStayAt: twoDaysAgo.toISOString(), tags: ['VIP'] },
  { id: 'gst-002', organizationId: 'org-001', firstName: 'Ibrahim', lastName: 'Diallo', email: 'ibrahim.d@email.com', phone: '+225 07 11 12 13', gender: 'male', nationality: 'Malian', country: 'Mali', city: 'Bamako', totalStays: 3, totalSpent: 405000, lastStayAt: yesterday.toISOString(), tags: [] },
  { id: 'gst-003', organizationId: 'org-001', firstName: 'Fatou', lastName: 'Coulibaly', email: 'fatou.c@email.com', phone: '+225 01 21 22 23', gender: 'female', nationality: 'Ivoirienne', country: "Côte d'Ivoire", city: 'Bouaké', totalStays: 1, totalSpent: 75000, lastStayAt: today.toISOString(), tags: [] },
  { id: 'gst-004', organizationId: 'org-001', firstName: 'Jean-Pierre', lastName: 'Aka', email: 'jp.aka@email.com', phone: '+225 05 31 32 33', gender: 'male', nationality: 'Ivoirienne', country: "Côte d'Ivoire", city: 'Yamoussoukro', totalStays: 12, totalSpent: 1560000, lastStayAt: threeDaysAgo.toISOString(), tags: ['VIP', 'Corporate'] },
  { id: 'gst-005', organizationId: 'org-001', firstName: 'Mariam', lastName: 'Traoré', phone: '+221 77 41 42 43', gender: 'female', nationality: 'Sénégalaise', country: 'Sénégal', city: 'Dakar', totalStays: 2, totalSpent: 260000, lastStayAt: today.toISOString(), tags: [] },
  { id: 'gst-006', organizationId: 'org-001', firstName: 'Olivier', lastName: 'N\'Guessan', email: 'olivier.ng@email.com', phone: '+225 07 51 52 53', gender: 'male', nationality: 'Ivoirienne', country: "Côte d'Ivoire", city: 'Abidjan', totalStays: 5, totalSpent: 650000, lastStayAt: yesterday.toISOString(), tags: ['Corporate'] },
  { id: 'gst-007', organizationId: 'org-001', firstName: 'Aïcha', lastName: 'Bamba', email: 'aicha.b@email.com', phone: '+225 01 61 62 63', gender: 'female', nationality: 'Ivoirienne', country: "Côte d'Ivoire", city: 'San Pedro', totalStays: 1, totalSpent: 45000, lastStayAt: today.toISOString(), tags: [] },
];

// ==========================================
// RÉSERVATIONS MOCK
// ==========================================
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-001', guestId: 'gst-001',
    reference: 'RES-2024-001001', checkInDate: yesterday.toISOString().split('T')[0],
    checkOutDate: tomorrow.toISOString().split('T')[0], nights: 2, adults: 2, children: 0,
    roomRate: 25000, taxAmount: 0, discountAmount: 0, totalAmount: 50000, paidAmount: 50000, balanceDue: 0,
    status: 'checked_in', source: 'direct', isWalkIn: false,
    room: MOCK_ROOMS[0], guest: MOCK_GUESTS[0],
  },
  {
    id: 'res-002', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-002', guestId: 'gst-002',
    reference: 'RES-2024-001002', checkInDate: yesterday.toISOString().split('T')[0],
    checkOutDate: today.toISOString().split('T')[0], nights: 1, adults: 1, children: 0,
    roomRate: 45000, taxAmount: 0, discountAmount: 0, totalAmount: 45000, paidAmount: 45000, balanceDue: 0,
    status: 'checked_in', source: 'booking.com', isWalkIn: false,
    room: MOCK_ROOMS[1], guest: MOCK_GUESTS[1],
  },
  {
    id: 'res-003', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-007', guestId: 'gst-003',
    reference: 'RES-2024-001003', checkInDate: today.toISOString().split('T')[0],
    checkOutDate: dayAfterTomorrow.toISOString().split('T')[0], nights: 2, adults: 1, children: 1,
    roomRate: 65000, taxAmount: 0, discountAmount: 0, totalAmount: 130000, paidAmount: 65000, balanceDue: 65000,
    status: 'pending', source: 'phone', isWalkIn: false,
    room: MOCK_ROOMS[6], guest: MOCK_GUESTS[2],
  },
  {
    id: 'res-004', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-013', guestId: 'gst-004',
    reference: 'RES-2024-001004', checkInDate: twoDaysAgo.toISOString().split('T')[0],
    checkOutDate: today.toISOString().split('T')[0], nights: 2, adults: 2, children: 0,
    roomRate: 120000, taxAmount: 0, discountAmount: 12000, totalAmount: 228000, paidAmount: 228000, balanceDue: 0,
    status: 'checked_in', source: 'direct', isWalkIn: false,
    room: MOCK_ROOMS[12], guest: MOCK_GUESTS[3],
  },
  {
    id: 'res-005', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-005', guestId: 'gst-005',
    reference: 'RES-2024-001005', checkInDate: today.toISOString().split('T')[0],
    checkOutDate: dayAfterTomorrow.toISOString().split('T')[0], nights: 2, adults: 1, children: 0,
    roomRate: 25000, taxAmount: 0, discountAmount: 0, totalAmount: 50000, paidAmount: 0, balanceDue: 50000,
    status: 'confirmed', source: 'walk-in', isWalkIn: true,
    room: MOCK_ROOMS[4], guest: MOCK_GUESTS[4],
  },
  {
    id: 'res-006', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-009', guestId: 'gst-006',
    reference: 'RES-2024-001006', checkInDate: today.toISOString().split('T')[0],
    checkOutDate: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0], nights: 3, adults: 1, children: 0,
    roomRate: 65000, taxAmount: 0, discountAmount: 0, totalAmount: 195000, paidAmount: 195000, balanceDue: 0,
    status: 'confirmed', source: 'direct', isWalkIn: false,
    room: MOCK_ROOMS[8], guest: MOCK_GUESTS[5],
  },
  {
    id: 'res-007', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-015', guestId: 'gst-007',
    reference: 'RES-2024-001007', checkInDate: threeDaysAgo.toISOString().split('T')[0],
    checkOutDate: yesterday.toISOString().split('T')[0], nights: 2, adults: 2, children: 0,
    roomRate: 120000, taxAmount: 0, discountAmount: 0, totalAmount: 240000, paidAmount: 240000, balanceDue: 0,
    status: 'checked_out', source: 'booking.com', isWalkIn: false,
    room: MOCK_ROOMS[14], guest: MOCK_GUESTS[6],
  },
  {
    id: 'res-008', organizationId: 'org-001', hotelId: 'hotel-001', roomId: 'rm-003', guestId: 'gst-002',
    reference: 'RES-2024-001008', checkInDate: tomorrow.toISOString().split('T')[0],
    checkOutDate: new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0], nights: 3, adults: 1, children: 0,
    roomRate: 25000, taxAmount: 0, discountAmount: 0, totalAmount: 75000, paidAmount: 75000, balanceDue: 0,
    status: 'confirmed', source: 'phone', isWalkIn: false,
    room: MOCK_ROOMS[2], guest: MOCK_GUESTS[1],
  },
];

// ==========================================
// PAIEMENTS MOCK
// ==========================================
export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-001', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-001', reference: 'PAY-2024-001001', amount: 50000, currency: 'FCFA', method: 'orange_money', status: 'completed', mobileNumber: '+225 05 01 02 03', paidAt: yesterday.toISOString(), reservation: MOCK_RESERVATIONS[0] },
  { id: 'pay-002', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-002', reference: 'PAY-2024-001002', amount: 45000, currency: 'FCFA', method: 'wave', status: 'completed', mobileNumber: '+225 07 11 12 13', paidAt: yesterday.toISOString(), reservation: MOCK_RESERVATIONS[1] },
  { id: 'pay-003', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-003', reference: 'PAY-2024-001003', amount: 65000, currency: 'FCFA', method: 'mtn_money', status: 'completed', mobileNumber: '+225 01 21 22 23', paidAt: today.toISOString(), reservation: MOCK_RESERVATIONS[2] },
  { id: 'pay-004', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-004', reference: 'PAY-2024-001004', amount: 228000, currency: 'FCFA', method: 'card', status: 'completed', paidAt: twoDaysAgo.toISOString(), reservation: MOCK_RESERVATIONS[3] },
  { id: 'pay-005', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-006', reference: 'PAY-2024-001006', amount: 195000, currency: 'FCFA', method: 'cash', status: 'completed', paidAt: today.toISOString(), reservation: MOCK_RESERVATIONS[5] },
  { id: 'pay-006', organizationId: 'org-001', hotelId: 'hotel-001', reservationId: 'res-007', reference: 'PAY-2024-001007', amount: 240000, currency: 'FCFA', method: 'orange_money', status: 'completed', mobileNumber: '+225 01 61 62 63', paidAt: threeDaysAgo.toISOString(), reservation: MOCK_RESERVATIONS[6] },
];

// ==========================================
// KPIs MOCK
// ==========================================
export const MOCK_KPIS: DashboardKPIs = {
  revenue: 1248000,
  revenueChange: 12.5,
  occupancyRate: 78,
  occupiedRooms: 14,
  totalRooms: 18,
  activeReservations: 6,
  arrivalsToday: 3,
  departuresToday: 2,
  uniqueGuests: 47,
  loyalGuests: 12,
};

// ==========================================
// REVENUE CHART DATA (30 jours)
// ==========================================
export function generateRevenueData(): RevenueDataPoint[] {
  const data: RevenueDataPoint[] = [];
  const baseRevenue = 35000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) ? 1.4 : 1;
    const randomFactor = 0.7 + Math.random() * 0.6;
    const revenue = Math.round(baseRevenue * weekendBoost * randomFactor);
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      revenue,
    });
  }
  return data;
}

// ==========================================
// PAYMENT METHOD BREAKDOWN
// ==========================================
export const MOCK_PAYMENT_BREAKDOWN: PaymentMethodBreakdown[] = [
  { method: 'orange_money', count: 12, amount: 840000, percentage: 42 },
  { method: 'wave', count: 8, amount: 480000, percentage: 24 },
  { method: 'cash', count: 6, amount: 360000, percentage: 18 },
  { method: 'mtn_money', count: 3, amount: 180000, percentage: 9 },
  { method: 'card', count: 2, amount: 120000, percentage: 6 },
  { method: 'bank_transfer', count: 1, amount: 20000, percentage: 1 },
];
