/**
 * OGOTEL CLOUD — Supabase Database Schema Reference
 *
 * This file documents the expected Supabase table structures.
 * The actual tables are created via SQL migrations in Supabase Dashboard.
 *
 * Use these table/column names in your Supabase queries.
 */

// ─── Table Names ─────────────────────────────────────────────────────────

export const TABLES = {
  /** User accounts (linked to Supabase Auth) */
  PROFILES: 'profiles',

  /** Multi-tenant organizations */
  ORGANIZATIONS: 'organizations',

  /** Organization membership junction */
  ORGANIZATION_MEMBERS: 'organization_members',

  /** Hotels belonging to an organization */
  HOTELS: 'hotels',

  /** Room types for a hotel */
  ROOM_TYPES: 'room_types',

  /** Physical rooms */
  ROOMS: 'rooms',

  /** Guest records */
  GUESTS: 'guests',

  /** Reservations / bookings */
  RESERVATIONS: 'reservations',

  /** Payment records */
  PAYMENTS: 'payments',

  /** Subscription payment records (for plan billing) */
  SUBSCRIPTION_PAYMENTS: 'subscription_payments',

  /** Activity log entries */
  ACTIVITY_LOG: 'activity_log',
} as const

// ─── Profile columns ─────────────────────────────────────────────────────

export interface ProfileRow {
  id: string                     // PK, matches auth.users.id
  organization_id?: string       // FK → organizations.id
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  gender?: string
  role: string                   // super_admin, owner, manager, receptionist, accountant
  language: string               // default 'fr'
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Organization columns ───────────────────────────────────────────────

export interface OrganizationRow {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  country: string                // default 'CI'
  city?: string
  logo_url?: string
  plan: string                   // trial, starter, pro, enterprise
  subscription_status: string    // active, expired, suspended, cancelled, pending_payment
  max_hotels: number
  max_users: number
  currency: string               // default 'XOF'
  created_at: string
  updated_at: string
}

// ─── Organization Member columns ────────────────────────────────────────

export interface OrganizationMemberRow {
  id: string
  organization_id: string
  user_id: string
  role: string                   // owner, manager, receptionist, accountant
  is_active: boolean
  created_at: string
}

// ─── Hotel columns ──────────────────────────────────────────────────────

export interface HotelRow {
  id: string
  organization_id: string
  name: string
  slug: string
  description?: string
  stars?: number
  email?: string
  phone?: string
  city?: string
  district?: string
  address?: string
  logo_url?: string
  cover_image_url?: string
  check_in_time: string          // default '14:00'
  check_out_time: string         // default '12:00'
  tax_rate: number               // default 18.0
  default_currency: string       // default 'XOF'
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Room Type columns ──────────────────────────────────────────────────

export interface RoomTypeRow {
  id: string
  organization_id: string
  hotel_id: string
  name: string
  description?: string
  base_price: number
  max_occupancy: number
  bed_count: number              // default 1
  bed_type?: string
  amenities: string[]            // JSONB
  images: string[]               // JSONB
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Room columns ───────────────────────────────────────────────────────

export interface RoomRow {
  id: string
  organization_id: string
  hotel_id: string
  room_type_id: string
  number: string
  floor?: string
  name?: string
  status: string                 // available, occupied, cleaning, maintenance, blocked
  price_override?: number
  maintenance_notes?: string
  last_cleaned_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Guest columns ──────────────────────────────────────────────────────

export interface GuestRow {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  gender?: string
  nationality?: string
  country?: string
  city?: string
  address?: string
  id_number?: string
  total_stays: number
  total_spent: number
  last_stay_at?: string
  tags: string[]                 // JSONB: VIP, Corporate, etc.
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Reservation columns ────────────────────────────────────────────────

export interface ReservationRow {
  id: string
  organization_id: string
  hotel_id: string
  room_id?: string
  guest_id: string
  reference: string
  check_in_date: string
  check_out_date: string
  actual_check_in?: string
  actual_check_out?: string
  nights: number
  adults: number
  children: number
  room_rate: number
  subtotal?: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  status: string                 // pending, confirmed, checked_in, checked_out, cancelled, no_show
  special_requests?: string
  notes?: string
  source: string                 // direct, booking.com, walk_in, phone, email, website
  is_walk_in: boolean
  created_by_id: string
  created_at: string
  updated_at: string
}

// ─── Payment columns ────────────────────────────────────────────────────

export interface PaymentRow {
  id: string
  organization_id: string
  hotel_id: string
  reservation_id: string
  reference: string
  amount: number
  currency: string               // default 'XOF'
  method: string                 // cash, orange_money, mtn_money, wave, moov_money, card, bank_transfer
  status: string                 // pending, completed, failed, refunded, partial
  mobile_number?: string
  operator_ref?: string
  notes?: string
  paid_at?: string
  created_by_id: string
  created_at: string
  updated_at: string
}

// ─── Subscription Payment columns ───────────────────────────────────────

export interface SubscriptionPaymentRow {
  id: string
  organization_id: string
  amount: number
  currency: string
  plan: string                   // trial, starter, pro, enterprise
  status: string                 // pending, completed, failed
  provider: string               // cinetpay, manual
  provider_ref?: string
  billing_email?: string
  paid_at?: string
  created_at: string
}

// ─── Activity Log columns ───────────────────────────────────────────────

export interface ActivityLogRow {
  id: string
  organization_id?: string
  user_id?: string
  action: string                 // reservation_created, payment_received, etc.
  entity_type?: string           // reservation, guest, room, etc.
  entity_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ─── Plan definitions ───────────────────────────────────────────────────

export const PLANS = {
  trial: {
    name: 'Essai',
    price: 0,
    maxHotels: 1,
    maxUsers: 5,
    maxRooms: 20,
    features: ['basic_pms', 'dashboard', 'reservations'],
  },
  starter: {
    name: 'Starter',
    price: 15000,
    maxHotels: 2,
    maxUsers: 10,
    maxRooms: 50,
    features: ['basic_pms', 'dashboard', 'reservations', 'reports', 'guests'],
  },
  pro: {
    name: 'Professionnel',
    price: 35000,
    maxHotels: 5,
    maxUsers: 25,
    maxRooms: 200,
    features: ['basic_pms', 'dashboard', 'reservations', 'reports', 'guests', 'payments', 'staff', 'calendar'],
  },
  enterprise: {
    name: 'Entreprise',
    price: 75000,
    maxHotels: 99,
    maxUsers: 100,
    maxRooms: 1000,
    features: ['all_features'],
  },
} as const

export type PlanKey = keyof typeof PLANS
