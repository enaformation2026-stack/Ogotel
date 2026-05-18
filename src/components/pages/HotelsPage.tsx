'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MOCK_HOTELS, MOCK_ROOMS, MOCK_RESERVATIONS, MOCK_ROOM_TYPES } from '@/lib/mock-data'
import { type Hotel, formatFCFA } from '@/types'
import { NewHotelDialog } from '@/components/dialogs/NewHotelDialog'
import { EditHotelDialog } from '@/components/dialogs/EditHotelDialog'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  BedDouble,
  Users,
  CalendarDays,
  AlertTriangle,
  Building2,
  Power,
  PowerOff,
} from 'lucide-react'
import { motion } from 'framer-motion'

// ==========================================
// TYPES
// ==========================================

interface HotelWithCounts extends Hotel {
  _count: {
    rooms: number
    roomTypes: number
    reservations: number
  }
}

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
}

// ==========================================
// COMPUTE HOTEL COUNTS FROM MOCK DATA
// ==========================================

function computeHotelCounts(hotelId: string) {
  return {
    rooms: MOCK_ROOMS.filter((r) => r.hotelId === hotelId).length,
    roomTypes: MOCK_ROOM_TYPES.filter((rt) => rt.hotelId === hotelId).length,
    reservations: MOCK_RESERVATIONS.filter(
      (r) =>
        r.hotelId === hotelId &&
        (r.status === 'confirmed' || r.status === 'pending' || r.status === 'checked_in')
    ).length,
  }
}

const INITIAL_HOTELS: HotelWithCounts[] = MOCK_HOTELS.map((h) => ({
  ...h,
  _count: computeHotelCounts(h.id),
}))

// ==========================================
// MAIN COMPONENT
// ==========================================

export function HotelsPage() {
  const [hotels, setHotels] = useState<HotelWithCounts[]>(INITIAL_HOTELS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<HotelWithCounts | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HotelWithCounts | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    if (searchQuery.trim() === '') return hotels
    const q = searchQuery.toLowerCase()
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.district?.toLowerCase().includes(q)
    )
  }, [hotels, searchQuery])

  // Handle hotel created
  const handleHotelCreated = (newHotel: Hotel) => {
    const hotelWithCounts: HotelWithCounts = {
      ...newHotel,
      _count: { rooms: 0, roomTypes: 0, reservations: 0 },
    }
    setHotels((prev) => [hotelWithCounts, ...prev])
    toast.success(`Hôtel "${newHotel.name}" ajouté avec succès`)
  }

  // Handle hotel updated
  const handleHotelUpdated = (updatedHotel: Hotel) => {
    setHotels((prev) =>
      prev.map((h) =>
        h.id === updatedHotel.id ? { ...h, ...updatedHotel, _count: h._count } : h
      )
    )
    toast.success(`Hôtel "${updatedHotel.name}" mis à jour`)
  }

  // Handle toggle active
  const handleToggleActive = (hotel: HotelWithCounts) => {
    const newStatus = !hotel.isActive
    fetch(`/api/hotels/${hotel.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: newStatus }),
    })
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('API not available')
      })
      .then((data) => {
        setHotels((prev) =>
          prev.map((h) =>
            h.id === hotel.id
              ? { ...h, isActive: data.isActive ?? newStatus }
              : h
          )
        )
        toast.success(
          newStatus
            ? `Hôtel "${hotel.name}" activé`
            : `Hôtel "${hotel.name}" désactivé`
        )
      })
      .catch(() => {
        // Offline fallback
        setHotels((prev) =>
          prev.map((h) =>
            h.id === hotel.id ? { ...h, isActive: newStatus } : h
          )
        )
        toast.success(
          newStatus
            ? `Hôtel "${hotel.name}" activé`
            : `Hôtel "${hotel.name}" désactivé`
        )
      })
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/hotels/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
      setHotels((prev) => prev.filter((h) => h.id !== deleteTarget.id))
      toast.success(`Hôtel "${deleteTarget.name}" supprimé`)
      setDeleteTarget(null)
    } catch (err: any) {
      // Offline fallback: still remove locally
      setHotels((prev) => prev.filter((h) => h.id !== deleteTarget.id))
      toast.success(`Hôtel "${deleteTarget.name}" supprimé`)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ====== HEADER SECTION ====== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Mes Hôtels
          </h1>
          <Badge variant="secondary" className="text-sm">
            {hotels.length}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un hôtel</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un hôtel..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ====== HOTEL CARDS GRID ====== */}
      {filteredHotels.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            {hotels.length === 0
              ? "Aucun hôtel enregistré"
              : "Aucun hôtel trouvé"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {hotels.length === 0
              ? "Commencez par ajouter votre premier hôtel."
              : "Essayez de modifier votre recherche."}
          </p>
          {hotels.length === 0 && (
            <Button
              className="mt-4 gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
              onClick={() => setShowNewDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Ajouter un hôtel
            </Button>
          )}
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredHotels.map((hotel) => (
            <motion.div key={hotel.id} variants={cardVariants}>
              <HotelCard
                hotel={hotel}
                onEdit={() => {
                  setSelectedHotel(hotel)
                  setShowEditDialog(true)
                }}
                onToggleActive={() => handleToggleActive(hotel)}
                onDelete={() => setDeleteTarget(hotel)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ====== NEW HOTEL DIALOG ====== */}
      <NewHotelDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={handleHotelCreated}
      />

      {/* ====== EDIT HOTEL DIALOG ====== */}
      <EditHotelDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setSelectedHotel(null)
        }}
        hotel={selectedHotel}
        onSuccess={handleHotelUpdated}
      />

      {/* ====== DELETE CONFIRMATION ====== */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Supprimer l&apos;hôtel
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{' '}
              ? Cette action est irréversible. Toutes les données associées
              (chambres, réservations, etc.) seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ==========================================
// HOTEL CARD COMPONENT
// ==========================================

function HotelCard({
  hotel,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  hotel: HotelWithCounts
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Cover Placeholder */}
      <div className="relative h-32 w-full bg-gradient-to-br from-[oklch(0.22_0.065_160)] to-[oklch(0.35_0.08_160)] flex items-center justify-center">
        <Building2 className="h-12 w-12 text-white/30" />
        {/* Active Badge */}
        <Badge
          className={`absolute top-3 right-3 ${
            hotel.isActive
              ? 'bg-emerald-500 text-white hover:bg-emerald-500'
              : 'bg-gray-400 text-white hover:bg-gray-400'
          }`}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
          {hotel.isActive ? 'Actif' : 'Inactif'}
        </Badge>
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white focus-visible:opacity-100 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="gap-2" onSelect={onEdit}>
              <Pencil className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onSelect={onToggleActive}>
              {hotel.isActive ? (
                <>
                  <PowerOff className="h-4 w-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  Activer
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600"
              onSelect={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Hotel Name + Stars */}
        <div>
          <h3 className="text-lg font-bold tracking-tight truncate">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i <= (hotel.stars ?? 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Location */}
        {(hotel.city || hotel.district) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {[hotel.city, hotel.district].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        <Separator />

        {/* Contact Info */}
        <div className="space-y-1.5">
          {hotel.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hotel.email}</span>
            </div>
          )}
          {hotel.phone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hotel.phone}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatChip
            icon={BedDouble}
            value={hotel._count.rooms}
            label={hotel._count.rooms === 1 ? 'Chambre' : 'Chambres'}
          />
          <StatChip
            icon={Users}
            value={hotel._count.roomTypes}
            label={hotel._count.roomTypes === 1 ? 'Type' : 'Types'}
          />
          <StatChip
            icon={CalendarDays}
            value={hotel._count.reservations}
            label={hotel._count.reservations === 1 ? 'Réserv.' : 'Réserv.'}
          />
        </div>

        <Separator />

        {/* Check-in / Check-out Times */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>
              Check-in <span className="font-medium text-foreground">{hotel.checkInTime}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span>
              Check-out <span className="font-medium text-foreground">{hotel.checkOutTime}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// STAT CHIP COMPONENT
// ==========================================

function StatChip({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 py-1.5">
      <div className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm font-bold">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}
