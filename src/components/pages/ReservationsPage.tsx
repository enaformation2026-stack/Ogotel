'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import {
  formatFCFA,
  formatDateShort,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from '@/types'
import {
  Plus,
  LogIn,
  Search,
  ArrowDown,
  ArrowUp,
  BedDouble,
  Activity,
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react'
import { NewReservationDialog } from '@/components/dialogs/NewReservationDialog'
import { toast } from 'sonner'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  confirmed:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  checked_in:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  checked_out:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  cancelled:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  no_show:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  'booking.com': 'Booking.com',
  phone: 'Téléphone',
  'walk-in': 'Walk-in',
}

const SOURCE_STYLES: Record<string, string> = {
  direct: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  'booking.com': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  phone: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
  'walk-in': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

type FilterKey = 'all' | ReservationStatus

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'checked_in', label: 'En séjour' },
  { key: 'checked_out', label: 'Terminées' },
  { key: 'cancelled', label: 'Annulées' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusClassName(status: ReservationStatus): string {
  return STATUS_STYLES[status] ?? ''
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return `${f}${l}`
}

function countByStatus(
  reservations: typeof MOCK_RESERVATIONS,
  status: FilterKey
): number {
  if (status === 'all') return reservations.length
  return reservations.filter((r) => r.status === status).length
}

// ── Component ────────────────────────────────────────────────────────────────

export function ReservationsPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showNewDialog, setShowNewDialog] = React.useState(false)

  const handleRefresh = () => {
    setShowNewDialog(false)
  }

  const filtered = React.useMemo(() => {
    let result = MOCK_RESERVATIONS

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter((r) => r.status === activeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) => {
        return (
          r.reference.toLowerCase().includes(q) ||
          `${r.guest?.firstName ?? ''} ${r.guest?.lastName ?? ''}`
            .toLowerCase()
            .includes(q) ||
          r.room?.number?.toLowerCase().includes(q) ||
          r.room?.roomType?.name?.toLowerCase().includes(q)
        )
      })
    }

    return result
  }, [activeFilter, searchQuery])

  // Quick stats computed from mock data
  const today = new Date().toISOString().split('T')[0]
  const arrivalsToday = MOCK_RESERVATIONS.filter(
    (r) => r.checkInDate === today && r.status !== 'cancelled' && r.status !== 'no_show'
  ).length
  const departuresToday = MOCK_RESERVATIONS.filter(
    (r) => r.checkOutDate === today && r.status !== 'cancelled'
  ).length
  const inStay = MOCK_RESERVATIONS.filter((r) => r.status === 'checked_in').length
  const occupancyRate = '78%'

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
          <Badge variant="secondary" className="text-sm font-semibold tabular-nums">
            {MOCK_RESERVATIONS.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setShowNewDialog(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nouvelle réservation</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Check-in rapide</span>
            <span className="sm:hidden">Check-in</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <ArrowDown className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Arrivées aujourd&apos;hui
              </p>
              <p className="text-lg font-bold tabular-nums leading-tight">{arrivalsToday}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <ArrowUp className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Départs aujourd&apos;hui
              </p>
              <p className="text-lg font-bold tabular-nums leading-tight">{departuresToday}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <BedDouble className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">En séjour</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{inStay}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <Activity className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Taux d&apos;occupation
              </p>
              <p className="text-lg font-bold tabular-nums leading-tight">{occupancyRate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const count = countByStatus(MOCK_RESERVATIONS, tab.key)
            const isActive = activeFilter === tab.key
            return (
              <Button
                key={tab.key}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`shrink-0 gap-1.5 text-sm ${
                  isActive ? '' : 'text-muted-foreground'
                }`}
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

        {/* Search + date range */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Référence, client, chambre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2 shrink-0" disabled>
            <Calendar className="size-4" />
            <span className="hidden sm:inline">Période</span>
          </Button>
        </div>
      </div>

      {/* ── Reservations Table / Cards ─────────────────────────────────── */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Aucune réservation trouvée.</p>
          </CardContent>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Chambre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Source
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((res) => (
                    <tr
                      key={res.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
                    >
                      {/* Référence */}
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-sm text-muted-foreground">
                          {res.reference}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(res.guest?.firstName, res.guest?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium whitespace-nowrap">
                            {res.guest?.firstName} {res.guest?.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Chambre */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{res.room?.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {res.room?.roomType?.name}
                          </span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="whitespace-nowrap text-sm">
                            {formatDateShort(res.checkInDate)}
                            <span className="mx-1 text-muted-foreground">&rarr;</span>
                            {formatDateShort(res.checkOutDate)}
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[11px] font-normal px-1.5 py-0"
                          >
                            {res.nights} nuit{res.nights > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </td>

                      {/* Montant */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold whitespace-nowrap">
                            {formatFCFA(res.totalAmount)}
                          </span>
                          {res.balanceDue > 0 && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Solde : {formatFCFA(res.balanceDue)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={getStatusClassName(res.status)}
                        >
                          {RESERVATION_STATUS_LABELS[res.status]}
                        </Badge>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[11px] px-1.5 py-0 font-normal ${
                            SOURCE_STYLES[res.source] ?? ''
                          }`}
                        >
                          {SOURCE_LABELS[res.source] ?? res.source}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4 text-muted-foreground" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="size-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="size-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <LogIn className="size-4" />
                              Check-in
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle2 className="size-4" />
                              Check-out
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                              <XCircle className="size-4" />
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet / medium screen table (hide source column) */}
            <div className="hidden md:block lg:hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Chambre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((res) => (
                    <tr
                      key={res.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {getInitials(res.guest?.firstName, res.guest?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm whitespace-nowrap truncate">
                              {res.guest?.firstName} {res.guest?.lastName}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {res.reference}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{res.room?.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {res.room?.roomType?.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="whitespace-nowrap text-sm">
                            {formatDateShort(res.checkInDate)}
                            <span className="mx-1 text-muted-foreground">&rarr;</span>
                            {formatDateShort(res.checkOutDate)}
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-normal px-1.5 py-0"
                          >
                            {res.nights} nuit{res.nights > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold whitespace-nowrap text-sm">
                            {formatFCFA(res.totalAmount)}
                          </span>
                          {res.balanceDue > 0 && (
                            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                              Solde : {formatFCFA(res.balanceDue)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${getStatusClassName(res.status)}`}
                        >
                          {RESERVATION_STATUS_LABELS[res.status]}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4 text-muted-foreground" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="size-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="size-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <LogIn className="size-4" />
                              Check-in
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle2 className="size-4" />
                              Check-out
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                              <XCircle className="size-4" />
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3 p-4">
              {filtered.map((res) => (
                <div
                  key={res.id}
                  className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:bg-muted/50"
                >
                  {/* Top row: reference + status + source */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {res.reference}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-normal ${
                          SOURCE_STYLES[res.source] ?? ''
                        }`}
                      >
                        {SOURCE_LABELS[res.source] ?? res.source}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getStatusClassName(res.status)}`}
                      >
                        {RESERVATION_STATUS_LABELS[res.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Client */}
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(res.guest?.firstName, res.guest?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm">
                        {res.guest?.firstName} {res.guest?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Chambre {res.room?.number} &middot; {res.room?.roomType?.name}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm">
                    <span>{formatDateShort(res.checkInDate)}</span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span>{formatDateShort(res.checkOutDate)}</span>
                    <Badge
                      variant="outline"
                      className="ml-1 text-[11px] font-normal px-1.5 py-0"
                    >
                      {res.nights} nuit{res.nights > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Bottom row: amount + action */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {formatFCFA(res.totalAmount)}
                      </span>
                      {res.balanceDue > 0 && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Solde : {formatFCFA(res.balanceDue)}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                          <MoreVertical className="size-3.5" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="size-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <LogIn className="size-4" />
                          Check-in
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <CheckCircle2 className="size-4" />
                          Check-out
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                          <XCircle className="size-4" />
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* New Reservation Dialog */}
      <NewReservationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
