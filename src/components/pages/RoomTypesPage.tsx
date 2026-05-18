'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { MOCK_ROOM_TYPES, MOCK_ROOMS } from '@/lib/mock-data'
import { formatFCFA, type RoomType } from '@/types'
import { NewRoomTypeDialog } from '@/components/dialogs/NewRoomTypeDialog'
import { EditRoomTypeDialog } from '@/components/dialogs/EditRoomTypeDialog'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  BedDouble,
  Power,
  PowerOff,
  AlertTriangle,
  DollarSign,
  Wifi,
  Snowflake,
  Tv,
  Wine,
  ShieldCheck,
  Bath,
  Waves,
} from 'lucide-react'
import { motion } from 'framer-motion'

// ==========================================
// TYPES
// ==========================================

interface RoomTypeWithMeta extends RoomType {
  _isActive: boolean
  _roomCount: number
}

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
}

// ==========================================
// AMENITIES CONFIG
// ==========================================

const AMENITY_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  wifi: { icon: Wifi, label: 'WiFi' },
  ac: { icon: Snowflake, label: 'Climatisation' },
  tv: { icon: Tv, label: 'TV' },
  minibar: { icon: Wine, label: 'Minibar' },
  safe: { icon: ShieldCheck, label: 'Coffre' },
  balcon: { icon: Waves, label: 'Balcon' },
  baignoire: { icon: Bath, label: 'Baignoire' },
  'vue-mer': { icon: Waves, label: 'Vue mer' },
}

// ==========================================
// INITIAL DATA
// ==========================================

const INITIAL_ROOM_TYPES: RoomTypeWithMeta[] = MOCK_ROOM_TYPES.map((rt) => ({
  ...rt,
  _isActive: true,
  _roomCount: MOCK_ROOMS.filter((r) => r.roomTypeId === rt.id).length,
}))

// ==========================================
// MAIN COMPONENT
// ==========================================

export function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithMeta[]>(INITIAL_ROOM_TYPES)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeWithMeta | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoomTypeWithMeta | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtered room types
  const filteredTypes = useMemo(() => {
    if (searchQuery.trim() === '') return roomTypes
    const q = searchQuery.toLowerCase()
    return roomTypes.filter(
      (rt) =>
        rt.name.toLowerCase().includes(q) ||
        rt.description?.toLowerCase().includes(q)
    )
  }, [roomTypes, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const totalTypes = roomTypes.length
    const totalRooms = roomTypes.reduce((sum, rt) => sum + rt._roomCount, 0)
    const avgPrice =
      totalTypes > 0
        ? Math.round(roomTypes.reduce((sum, rt) => sum + rt.basePrice, 0) / totalTypes)
        : 0
    const sorted = [...roomTypes].sort((a, b) => a.basePrice - b.basePrice)
    const cheapest = sorted[0] ?? null
    const mostExpensive = sorted[sorted.length - 1] ?? null
    return { totalTypes, totalRooms, avgPrice, cheapest, mostExpensive }
  }, [roomTypes])

  // Handle room type created
  const handleRoomTypeCreated = (newType: RoomType) => {
    const typeWithMeta: RoomTypeWithMeta = {
      ...newType,
      _isActive: true,
      _roomCount: 0,
    }
    setRoomTypes((prev) => [typeWithMeta, ...prev])
    toast.success(`Type "${newType.name}" ajouté avec succès`)
  }

  // Handle room type updated
  const handleRoomTypeUpdated = (updatedType: RoomType) => {
    setRoomTypes((prev) =>
      prev.map((rt) =>
        rt.id === updatedType.id
          ? { ...rt, ...updatedType, _isActive: rt._isActive, _roomCount: rt._roomCount }
          : rt
      )
    )
    toast.success(`Type "${updatedType.name}" mis à jour`)
  }

  // Handle toggle active
  const handleToggleActive = (roomType: RoomTypeWithMeta) => {
    const newStatus = !roomType._isActive
    setRoomTypes((prev) =>
      prev.map((rt) =>
        rt.id === roomType.id ? { ...rt, _isActive: newStatus } : rt
      )
    )
    toast.success(
      newStatus
        ? `Type "${roomType.name}" activé`
        : `Type "${roomType.name}" désactivé`
    )
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/room-types/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
      setRoomTypes((prev) => prev.filter((rt) => rt.id !== deleteTarget.id))
      toast.success(`Type "${deleteTarget.name}" supprimé`)
      setDeleteTarget(null)
    } catch {
      // Offline fallback
      setRoomTypes((prev) => prev.filter((rt) => rt.id !== deleteTarget.id))
      toast.success(`Type "${deleteTarget.name}" supprimé`)
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
            Types de Chambres
          </h1>
          <Badge variant="secondary" className="text-sm">
            {roomTypes.length}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un type</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un type..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ====== DESKTOP TABLE (lg+) ====== */}
      {filteredTypes.length > 0 && (
        <>
          {/* Hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nom</TableHead>
                    <TableHead className="min-w-[130px]">Prix</TableHead>
                    <TableHead className="min-w-[160px]">Capacité</TableHead>
                    <TableHead className="min-w-[90px]">Chambres</TableHead>
                    <TableHead className="min-w-[100px]">Statut</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTypes.map((rt) => (
                    <motion.tr
                      key={rt.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="hover:bg-muted/50 border-b transition-colors"
                    >
                      {/* Nom */}
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold">{rt.name}</p>
                          {rt.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                              {rt.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Prix */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{formatFCFA(rt.basePrice)}</span>
                        </div>
                      </TableCell>

                      {/* Capacité */}
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{rt.maxOccupancy}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BedDouble className="h-3.5 w-3.5" />
                            <span>{rt.bedCount}</span>
                          </div>
                          {rt.bedType && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {rt.bedType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Chambres */}
                      <TableCell>
                        <span className="text-sm font-medium">{rt._roomCount}</span>
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        <Badge
                          className={
                            rt._isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                          }
                        >
                          <span
                            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                              rt._isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {rt._isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onSelect={() => {
                                setSelectedRoomType(rt)
                                setShowEditDialog(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onSelect={() => handleToggleActive(rt)}
                            >
                              {rt._isActive ? (
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
                              onSelect={() => setDeleteTarget(rt)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* ====== MOBILE CARDS (below lg) ====== */}
          <div className="lg:hidden">
            <motion.div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredTypes.map((rt) => (
                <motion.div key={rt.id} variants={cardVariants}>
                  <RoomTypeCard
                    roomType={rt}
                    onEdit={() => {
                      setSelectedRoomType(rt)
                      setShowEditDialog(true)
                    }}
                    onToggleActive={() => handleToggleActive(rt)}
                    onDelete={() => setDeleteTarget(rt)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* ====== EMPTY STATE ====== */}
      {filteredTypes.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12">
          <BedDouble className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            {roomTypes.length === 0
              ? 'Aucun type de chambre enregistré'
              : 'Aucun type de chambre trouvé'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {roomTypes.length === 0
              ? 'Commencez par ajouter votre premier type de chambre.'
              : 'Essayez de modifier votre recherche.'}
          </p>
          {roomTypes.length === 0 && (
            <Button
              className="mt-4 gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
              onClick={() => setShowNewDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Ajouter un type
            </Button>
          )}
        </Card>
      )}

      {/* ====== STATS SUMMARY ====== */}
      {roomTypes.length > 0 && (
        <Card className="p-4 md:p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Résumé des types
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatItem
              label="Total types"
              value={stats.totalTypes}
              className="text-foreground"
            />
            <StatItem
              label="Prix moyen"
              value={formatFCFA(stats.avgPrice)}
              isText
            />
            <StatItem
              label="Total chambres"
              value={stats.totalRooms}
              className="text-foreground"
            />
            <StatItem
              label="Moins cher"
              value={stats.cheapest ? stats.cheapest.name : '—'}
              subValue={stats.cheapest ? formatFCFA(stats.cheapest.basePrice) : undefined}
              isText
            />
            <StatItem
              label="Plus cher"
              value={stats.mostExpensive ? stats.mostExpensive.name : '—'}
              subValue={stats.mostExpensive ? formatFCFA(stats.mostExpensive.basePrice) : undefined}
              isText
            />
          </div>
        </Card>
      )}

      {/* ====== NEW ROOM TYPE DIALOG ====== */}
      <NewRoomTypeDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={handleRoomTypeCreated}
      />

      {/* ====== EDIT ROOM TYPE DIALOG ====== */}
      <EditRoomTypeDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setSelectedRoomType(null)
        }}
        roomType={selectedRoomType}
        onSuccess={handleRoomTypeUpdated}
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
              Supprimer le type de chambre
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Êtes-vous sûr de vouloir supprimer{' '}
                  <span className="font-semibold text-foreground">
                    {deleteTarget?.name}
                  </span>{' '}
                  ?
                </p>
                {deleteTarget && deleteTarget._roomCount > 0 && (
                  <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5 text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-medium">Attention :</span> {deleteTarget._roomCount}{' '}
                    chambre{deleteTarget._roomCount > 1 ? 's' : ''} sont associée
                    {deleteTarget._roomCount > 1 ? 's' : ''} à ce type. La suppression
                    pourrait affecter ces chambres.
                  </p>
                )}
                <p className="mt-2 text-muted-foreground">
                  Cette action est irréversible.
                </p>
              </div>
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
// MOBILE CARD COMPONENT
// ==========================================

function RoomTypeCard({
  roomType,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  roomType: RoomTypeWithMeta
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  return (
    <Card className="group relative p-4 space-y-3 transition-all duration-200 hover:shadow-md">
      {/* Header row: Name + Actions */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold tracking-tight truncate">{roomType.name}</h3>
          {roomType.description && (
            <p className="mt-0.5 text-sm text-muted-foreground truncate">
              {roomType.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Badge
            className={
              roomType._isActive
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
            }
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                roomType._isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            {roomType._isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" onSelect={onEdit}>
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={onToggleActive}>
                {roomType._isActive ? (
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
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Prix</p>
          <p className="mt-0.5 font-semibold text-sm">{formatFCFA(roomType.basePrice)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacité</p>
          <div className="mt-0.5 flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-sm">{roomType.maxOccupancy}</span>
            <span className="text-muted-foreground text-xs">·</span>
            <BedDouble className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-sm">{roomType.bedCount}</span>
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Chambres</p>
          <p className="mt-0.5 font-semibold text-sm">{roomType._roomCount}</p>
        </div>
      </div>

      {/* Amenities (compact) */}
      {roomType.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {roomType.amenities.slice(0, 5).map((amenity) => {
            const config = AMENITY_ICONS[amenity]
            if (!config) return null
            const Icon = config.icon
            return (
              <Badge key={amenity} variant="outline" className="gap-1 text-xs font-normal py-0">
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
            )
          })}
          {roomType.amenities.length > 5 && (
            <Badge variant="outline" className="text-xs font-normal py-0">
              +{roomType.amenities.length - 5}
            </Badge>
          )}
        </div>
      )}
    </Card>
  )
}

// ==========================================
// STAT ITEM COMPONENT
// ==========================================

function StatItem({
  label,
  value,
  subValue,
  isText,
  className,
}: {
  label: string
  value: string | number
  subValue?: string
  isText?: boolean
  className?: string
}) {
  return (
    <div className="min-w-0">
      <p className={`text-xl font-bold leading-none ${className ?? 'text-emerald-600 dark:text-emerald-400'}`}>
        {isText && typeof value === 'string' ? (
          <span className="text-lg">{value}</span>
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground truncate">{label}</p>
      {subValue && (
        <p className="text-[11px] text-muted-foreground/70 truncate">{subValue}</p>
      )}
    </div>
  )
}
