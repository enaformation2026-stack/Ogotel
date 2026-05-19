'use client'

import * as React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { MOCK_ROOMS, MOCK_RESERVATIONS } from '@/lib/mock-data'
import {
  ROOM_STATUS_LABELS,
  formatFCFA,
  formatDateShort,
  type RoomStatus,
  type Room,
} from '@/types'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  BedDouble,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Clock,
  ArrowDown,
  Loader2,
  Sparkle,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RoomStatus, { className: string; icon: React.ElementType; dotClass: string }> = {
  available: {
    className: 'border-l-emerald-500',
    icon: CheckCircle2,
    dotClass: 'bg-emerald-500',
  },
  occupied: {
    className: 'border-l-red-500',
    icon: XCircle,
    dotClass: 'bg-red-500',
  },
  cleaning: {
    className: 'border-l-amber-500',
    icon: Sparkles,
    dotClass: 'bg-amber-500',
  },
  maintenance: {
    className: 'border-l-slate-400',
    icon: ShieldX,
    dotClass: 'bg-slate-400',
  },
  blocked: {
    className: 'border-l-gray-400',
    icon: ShieldX,
    dotClass: 'bg-gray-400',
  },
}

type FilterKey = 'all' | 'cleaning' | 'occupied' | 'available' | 'maintenance'

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'cleaning', label: 'À nettoyer' },
  { key: 'occupied', label: 'Occupées' },
  { key: 'available', label: 'Disponibles' },
  { key: 'maintenance', label: 'Maintenance' },
]

// ── Animation ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// ── Component ────────────────────────────────────────────────────────────────

export function HousekeepingPage() {
  const isMobile = useIsMobile()
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Compute stats
  const stats = useMemo(() => {
    const toClean = rooms.filter((r) => r.status === 'cleaning').length
    const available = rooms.filter((r) => r.status === 'available').length
    const occupied = rooms.filter((r) => r.status === 'occupied').length
    const departuresToday = MOCK_RESERVATIONS.filter(
      (r) => r.checkOutDate === today && r.status !== 'cancelled'
    ).length
    return { toClean, available, occupied, departuresToday }
  }, [rooms, today])

  // Cleaning queue: rooms in 'cleaning' status + rooms where check-out is today
  const cleaningQueue = useMemo(() => {
    const checkOutRoomIds = new Set(
      MOCK_RESERVATIONS
        .filter(
          (r) => r.checkOutDate === today && (r.status === 'checked_in' || r.status === 'confirmed')
        )
        .map((r) => r.roomId)
    )
    return rooms.filter(
      (r) => r.status === 'cleaning' || (checkOutRoomIds.has(r.id) && r.status === 'occupied')
    )
  }, [rooms, today])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (activeFilter === 'all') return rooms
    return rooms.filter((r) => r.status === activeFilter)
  }, [rooms, activeFilter])

  // Mark room as available
  const markClean = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur')
      }
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: 'available' as RoomStatus } : r))
      )
      toast.success('Chambre marquée comme disponible')
    } catch {
      // Offline fallback
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: 'available' as RoomStatus } : r))
      )
      toast.success('Chambre marquée comme disponible')
    }
  }, [])

  // Mark all cleaning rooms as available
  const markAllClean = useCallback(async () => {
    setIsMarkingAll(true)
    try {
      const cleaningIds = rooms
        .filter((r) => r.status === 'cleaning')
        .map((r) => r.id)

      await Promise.all(
        cleaningIds.map((id) =>
          fetch(`/api/rooms/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'available' }),
          }).catch(() => {})
        )
      )

      setRooms((prev) =>
        prev.map((r) =>
          r.status === 'cleaning' ? { ...r, status: 'available' as RoomStatus } : r
        )
      )
      toast.success(`${cleaningIds.length} chambre(s) marquée(s) comme disponible(s)`)
    } catch {
      setRooms((prev) =>
        prev.map((r) =>
          r.status === 'cleaning' ? { ...r, status: 'available' as RoomStatus } : r
        )
      )
      toast.success('Toutes les chambres ont été marquées comme disponibles')
    } finally {
      setIsMarkingAll(false)
      setShowMarkAllDialog(false)
    }
  }, [rooms])

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setRooms(MOCK_ROOMS)
      setIsLoading(false)
      toast.success('Données actualisées')
    }, 800)
  }, [])

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Ménage</h1>
        </div>
        <Card className="flex flex-col items-center justify-center p-12">
          <AlertCircle className="mb-3 size-10 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={handleRefresh}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Ménage</h1>
          <Badge variant="secondary" className="text-sm">
            {rooms.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {stats.toClean > 0 && (
            <Button
              className="gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
              onClick={() => setShowMarkAllDialog(true)}
            >
              <Sparkle className="size-4" />
              <span className="hidden sm:inline">Tout marquer propre</span>
              <span className="sm:hidden">Tout propre</span>
            </Button>
          )}
          <Button variant="outline" size="icon" className="size-8" onClick={handleRefresh}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">À nettoyer</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{stats.toClean}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Disponibles</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{stats.available}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <BedDouble className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Occupées</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{stats.occupied}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <ArrowDown className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Départs aujourd&apos;hui
              </p>
              <p className="text-lg font-bold tabular-nums leading-tight">
                {stats.departuresToday}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Cleaning Queue ─────────────────────────────────────────────── */}
      {cleaningQueue.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="size-4" />
            File d&apos;attente — Priorité haute
            <Badge variant="secondary" className="ml-1">
              {cleaningQueue.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cleaningQueue.map((room) => {
              const isCheckoutToday = MOCK_RESERVATIONS.some(
                (r) =>
                  r.roomId === room.id &&
                  r.checkOutDate === today &&
                  (r.status === 'checked_in' || r.status === 'confirmed')
              )
              return (
                <motion.div
                  key={room.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className={`border-l-4 ${isCheckoutToday ? 'border-l-blue-500' : 'border-l-amber-500'} transition-all hover:shadow-md`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                            {room.number}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              Chambre {room.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {room.roomType?.name ?? '—'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${isCheckoutToday ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                        >
                          {isCheckoutToday ? 'Départ aujourd\'hui' : ROOM_STATUS_LABELS[room.status]}
                        </Badge>
                      </div>
                      <Button
                        className="mt-3 w-full gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
                        size="sm"
                        onClick={() => markClean(room.id)}
                      >
                        <Sparkle className="size-3.5" />
                        Marquer propre
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Filter Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key
          const count =
            tab.key === 'all'
              ? rooms.length
              : rooms.filter((r) => r.status === tab.key).length
          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 gap-1.5 text-sm ${isActive ? '' : 'text-muted-foreground'}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="ml-0.5 text-[11px] px-1.5 py-0 tabular-nums"
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Sparkles className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            Aucune chambre trouvée
          </p>
          <p className="text-sm text-muted-foreground/70">
            Toutes les chambres sont à jour !
          </p>
        </Card>
      ) : (
        /* ── Rooms Grid ─────────────────────────────────────────────────── */
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredRooms.map((room) => {
            const config = STATUS_CONFIG[room.status]
            const StatusIcon = config.icon
            const canClean = room.status === 'cleaning' || room.status === 'occupied'
            return (
              <motion.div key={room.id} variants={cardVariants}>
                <Card
                  className={`group relative border-l-4 ${config.className} rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold tracking-tight">{room.number}</h3>
                    <div
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${config.dotClass === 'bg-emerald-500' ? 'bg-emerald-100 text-emerald-700' : config.dotClass === 'bg-red-500' ? 'bg-red-100 text-red-700' : config.dotClass === 'bg-amber-500' ? 'bg-amber-100 text-amber-700' : config.dotClass === 'bg-slate-400' ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <StatusIcon className="size-3" />
                      {ROOM_STATUS_LABELS[room.status]}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {room.roomType?.name ?? '—'}
                  </p>
                  <div className="my-2 border-t" />
                  <p className="text-xs text-muted-foreground">
                    {room.floor ?? '—'}
                  </p>
                  {canClean && (
                    <Button
                      className="mt-3 w-full gap-1.5 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
                      size="sm"
                      onClick={() => markClean(room.id)}
                    >
                      <Sparkle className="size-3" />
                      <span className="text-xs">Marquer propre</span>
                    </Button>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* ── Mark All Dialog ────────────────────────────────────────────── */}
      <AlertDialog
        open={showMarkAllDialog}
        onOpenChange={setShowMarkAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkle className="size-5 text-[oklch(0.22_0.065_160)]" />
              Marquer toutes les chambres comme propres
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cela va changer le statut de {stats.toClean} chambre(s) en
              &laquo; Disponible &raquo;. Cette action est immédiate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingAll}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={markAllClean}
              disabled={isMarkingAll}
              className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            >
              {isMarkingAll ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Confirmer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
