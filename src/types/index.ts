// Types métier OGOTEL CLOUD

export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'manager'
  | 'receptionist'
  | 'accountant';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'cleaning'
  | 'maintenance'
  | 'blocked';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type PaymentMethod =
  | 'cash'
  | 'orange_money'
  | 'mtn_money'
  | 'wave'
  | 'moov_money'
  | 'card'
  | 'bank_transfer';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partial';

export type SubscriptionPlan =
  | 'trial'
  | 'starter'
  | 'pro'
  | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'suspended'
  | 'cancelled'
  | 'pending_payment';

export type GenderType = 'male' | 'female' | 'other';

export interface HotelCount {
  rooms: number;
  roomTypes: number;
  reservations: number;
}

export interface Hotel {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  stars?: number;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  checkInTime: string;
  checkOutTime: string;
  taxRate: number;
  defaultCurrency: string;
  isActive: boolean;
  _count?: HotelCount;
}

export interface RoomType {
  id: string;
  organizationId: string;
  hotelId: string;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  bedCount: number;
  bedType?: string;
  amenities: string[];
  images: string[];
}

export interface Room {
  id: string;
  organizationId: string;
  hotelId: string;
  roomTypeId: string;
  number: string;
  floor?: string;
  name?: string;
  status: RoomStatus;
  priceOverride?: number;
  maintenanceNotes?: string;
  lastCleanedAt?: string;
  isActive: boolean;
  roomType?: RoomType;
}

export interface Guest {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: GenderType;
  nationality?: string;
  country?: string;
  city?: string;
  address?: string;
  totalStays: number;
  totalSpent: number;
  lastStayAt?: string;
  tags: string[];
}

export interface Reservation {
  id: string;
  organizationId: string;
  hotelId: string;
  roomId: string;
  guestId: string;
  reference: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  nights: number;
  adults: number;
  children: number;
  roomRate: number;
  subtotal?: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: ReservationStatus;
  specialRequests?: string;
  notes?: string;
  source: string;
  isWalkIn: boolean;
  room?: Room;
  guest?: Guest;
}

export interface Payment {
  id: string;
  organizationId: string;
  hotelId: string;
  reservationId: string;
  reference: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  mobileNumber?: string;
  operatorRef?: string;
  notes?: string;
  paidAt?: string;
  reservation?: Reservation;
}

export interface UserProfile {
  id: string;
  organizationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  gender?: GenderType;
  role: UserRole;
  language: string;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  country: string;
  city?: string;
  logoUrl?: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  maxHotels: number;
  maxUsers: number;
  currency: string;
}

// Types pour le Dashboard
export interface DashboardKPIs {
  revenue: number;
  revenueChange: number;
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  activeReservations: number;
  arrivalsToday: number;
  departuresToday: number;
  uniqueGuests: number;
  loyalGuests: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

// Formatage FCFA
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// Formatage date relative
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} ans`;
}

// Formatage date courte
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}

// Labels de statut chambre
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Libre',
  occupied: 'Occupée',
  cleaning: 'Nettoyage',
  maintenance: 'Maintenance',
  blocked: 'Bloquée',
};

// Labels de statut réservation
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  checked_in: 'En séjour',
  checked_out: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'No-show',
};

// Labels méthode paiement
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  orange_money: 'Orange Money',
  mtn_money: 'MTN Money',
  wave: 'Wave',
  moov_money: 'Moov Money',
  card: 'Carte bancaire',
  bank_transfer: 'Virement bancaire',
};
