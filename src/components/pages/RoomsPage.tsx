'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { MOCK_ROOMS } from '@/lib/mock-data'
import { formatFCFA, ROOM_STATUS_LABELS, type RoomStatus, type Room } from '@/types'
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wrench,
  Ban,
  Building2,
  Banknote,
} from 'lucide-react'

// ==========================================
// STATUS CONFIGURATION
// ==========================================

const STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; className: string; icon: React.ElementType; borderClass: string }
> = {
  available: {
    label: 'Libre',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    icon: CheckCircle2,
    borderClass: 'border-l-emerald-500',
  },
  occupied: {
    label: 'Occupée',
    className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    icon: XCircle,
    borderClass: 'border-l-red-500',
  },
  cleaning: {
    label: 'Nettoyage',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    icon: Sparkles,
    borderClass: 'border-l-amber-500',
  },
  maintenance: {
    label: 'Maintenance',
    className:
      'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400',
    icon: Wrench,
    borderClass: 'border-l-slate-400',
  },
  blocked: {
    label: 'Bloquée',
    className:
      'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    icon: Ban,
    borderClass: 'border-l-gray-400',
  },
}

// ==========================================
// FILTER TABS CONFIGURATION
// ==========================================

type FilterKey = 'all' | RoomStatus

interface FilterTab {
  key: FilterKey
  label: string
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function RoomsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Compute status counts from mock data
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_ROOMS.length }
    for (const room of MOCK_ROOMS) {
      counts[room.status] = (counts[room.status] || 0) + 1
    }
    return counts
  }, [])

  // Filter tabs
  const filterTabs: FilterTab[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'available', label: 'Libres' },
    { key: 'occupied', label: 'Occupées' },
    { key: 'cleaning', label: 'Nettoyage' },
    { key: 'maintenance', label: 'Maintenance' },
  ]

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      const matchesStatus = activeFilter === 'all' || room.status === activeFilter
      const matchesSearch =
        searchQuery.trim() === '' ||
        room.number.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [activeFilter, searchQuery])

  // Stats summary
  const stats = useMemo(() => {
    return {
      total: MOCK_ROOMS.length,
      available: statusCounts['available'] || 0,
      occupied: statusCounts['occupied'] || 0,
      cleaning: statusCounts['cleaning'] || 0,
      maintenance: statusCounts['maintenance'] || 0,
      blocked: statusCounts['blocked'] || 0,
    }
  }, [statusCounts])

  return (
    <div className="space-y-6">
      {/* ====== HEADER SECTION ====== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Chambres
          </h1>
          <Badge variant="secondary" className="text-sm">
            {MOCK_ROOMS.length}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" disabled className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter une chambre</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ====== FILTER TABS ====== */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const count = statusCounts[tab.key] || 0
          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="ml-1 h-5 min-w-5 px-1.5 text-xs"
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* ====== ROOM GRID ====== */}
      {filteredRooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            Aucune chambre trouvée
          </p>
          <p className="text-sm text-muted-foreground/70">
            Essayez de modifier vos filtres ou votre recherche.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {/* ====== STATS SUMMARY ====== */}
      <Card className="p-4 md:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Résumé des chambres
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <StatItem
            label="Total"
            value={stats.total}
            className="text-foreground"
          />
          <StatItem
            label="Libres"
            value={stats.available}
            dotClassName="bg-emerald-500"
          />
          <StatItem
            label="Occupées"
            value={stats.occupied}
            dotClassName="bg-red-500"
          />
          <StatItem
            label="Nettoyage"
            value={stats.cleaning}
            dotClassName="bg-amber-500"
          />
          <StatItem
            label="Maintenance"
            value={stats.maintenance}
            dotClassName="bg-slate-400"
          />
          <StatItem
            label="Bloquées"
            value={stats.blocked}
            dotClassName="bg-gray-400"
          />
        </div>
      </Card>
    </div>
  )
}

// ==========================================
// ROOM CARD COMPONENT
// ==========================================

function RoomCard({ room }: { room: Room }) {
  const config = STATUS_CONFIG[room.status]
  const StatusIcon = config.icon
  const price = room.priceOverride ?? room.roomType?.basePrice ?? 0

  return (
    <Card
      className={`group relative border-l-4 ${config.borderClass} rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-default`}
    >
      {/* Room Number */}
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold tracking-tight">{room.number}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Changer le statut
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(Object.keys(STATUS_CONFIG) as RoomStatus[]).map((status) => {
                  const sConfig = STATUS_CONFIG[status]
                  const SIcon = sConfig.icon
                  return (
                    <DropdownMenuItem key={status} className="gap-2">
                      <SIcon className="h-4 w-4" />
                      {sConfig.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Calendar className="h-4 w-4" />
              Voir les réservations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Room Type */}
      <p className="mt-0.5 text-sm text-muted-foreground truncate">
        {room.roomType?.name ?? 'Non défini'}
      </p>

      {/* Separator */}
      <div className="my-3 border-t" />

      {/* Floor & Price */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{room.floor ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Banknote className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatFCFA(price)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex justify-center">
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${config.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// STAT ITEM COMPONENT
// ==========================================

function StatItem({
  label,
  value,
  dotClassName,
  className,
}: {
  label: string
  value: number
  dotClassName?: string
  className?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      {dotClassName && (
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      )}
      <div className="min-w-0">
        <p className={`text-xl font-bold leading-none ${className ?? ''}`}>
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  )
}
