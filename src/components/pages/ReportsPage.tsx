'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { MOCK_GUESTS, MOCK_KPIS, MOCK_ROOMS } from '@/lib/mock-data'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import { formatFCFA } from '@/types'
import {
  Download,
  TrendingUp,
  TrendingDown,
  BedDouble,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react'

// ==========================================
// TYPES
// ==========================================

type PeriodKey = '7d' | '30d' | '90d' | '12m' | 'custom'

interface PeriodOption {
  key: PeriodKey
  label: string
}

// ==========================================
// CONSTANTS
// ==========================================

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: '12m', label: '12 mois' },
  { key: 'custom', label: 'Personnalisé' },
]

const REVENUE_BAR_DATA = [
  { label: 'Lun', value: 68 },
  { label: 'Mar', value: 45 },
  { label: 'Mer', value: 82 },
  { label: 'Jeu', value: 55 },
  { label: 'Ven', value: 91 },
  { label: 'Sam', value: 100 },
  { label: 'Dim', value: 74 },
]

const ROOM_TYPE_DATA = [
  { name: 'Standard', occupancy: 75, revenue: 450000, barPct: 58 },
  { name: 'Deluxe', occupancy: 80, revenue: 580000, barPct: 74 },
  { name: 'Suite Junior', occupancy: 85, revenue: 650000, barPct: 83 },
  { name: 'Suite Royale', occupancy: 92, revenue: 720000, barPct: 100 },
]

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('7d')

  // ---- Derived Data ----
  const topClients = useMemo(() => {
    return [...MOCK_GUESTS]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
  }, [])

  const avgPricePerNight = useMemo(() => {
    const rates = MOCK_RESERVATIONS.map((r) => r.roomRate)
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
  }, [])

  const avgStayDuration = useMemo(() => {
    const nights = MOCK_RESERVATIONS.map((r) => r.nights)
    return (nights.reduce((s, n) => s + n, 0) / nights.length).toFixed(1)
  }, [])

  const revenuePerRoom = useMemo(() => {
    return Math.round(MOCK_KPIS.revenue / MOCK_KPIS.totalRooms)
  }, [])

  const previousPeriodRevenue = useMemo(() => {
    return Math.round(MOCK_KPIS.revenue / (1 + MOCK_KPIS.revenueChange / 100))
  }, [])

  return (
    <div className="space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Rapports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyse détaillée de la performance de votre hôtel
          </p>
        </div>
        <Button variant="outline" disabled className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </div>

      {/* ====== PERIOD SELECTOR ====== */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            variant={activePeriod === opt.key ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => setActivePeriod(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* ====== REVENUE SECTION ====== */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Revenus totaux</CardDescription>
          <div className="flex items-end gap-3">
            <CardTitle className="text-3xl font-bold md:text-4xl">
              {formatFCFA(MOCK_KPIS.revenue)}
            </CardTitle>
            <div className="mb-1 flex items-center gap-1">
              {MOCK_KPIS.revenueChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  MOCK_KPIS.revenueChange > 0
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                +{MOCK_KPIS.revenueChange}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs période précédente ({formatFCFA(previousPeriodRevenue)})
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* CSS-only Bar Chart */}
          <div className="mt-4 flex h-48 items-end justify-between gap-2 sm:gap-4">
            {REVENUE_BAR_DATA.map((bar, idx) => (
              <div
                key={idx}
                className="flex flex-1 flex-col items-center gap-2"
              >
                {/* Tooltip-style value label */}
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round((bar.value / 100) * 50000).toLocaleString('fr-FR')}
                </span>
                {/* Bar */}
                <div className="relative w-full overflow-hidden rounded-t-md bg-primary/10">
                  <div
                    className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-700"
                    style={{
                      height: `${bar.value}%`,
                      background:
                        idx === REVENUE_BAR_DATA.findIndex(
                          (b) => b.value === Math.max(...REVENUE_BAR_DATA.map((x) => x.value))
                        )
                          ? 'var(--primary)'
                          : 'var(--chart-1)',
                      opacity:
                        idx ===
                        REVENUE_BAR_DATA.findIndex(
                          (b) => b.value === Math.max(...REVENUE_BAR_DATA.map((x) => x.value))
                        )
                          ? 1
                          : 0.65,
                    }}
                  />
                </div>
                {/* Day label */}
                <span className="text-xs font-medium text-muted-foreground">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Revenus journaliers moyens sur la période sélectionnée (FCFA)
          </p>
        </CardContent>
      </Card>

      {/* ====== KEY METRICS GRID (2x2) ====== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 1. Taux d'occupation moyen */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Taux d&apos;occupation moyen
                </p>
                <p className="text-3xl font-bold">{MOCK_KPIS.occupancyRate}%</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950/50">
                <BedDouble className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Progress value={MOCK_KPIS.occupancyRate} className="h-2.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{MOCK_KPIS.occupiedRooms} chambres occupées</span>
                <span>sur {MOCK_KPIS.totalRooms}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Prix moyen / nuit */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Prix moyen / nuit
                </p>
                <p className="text-3xl font-bold">
                  {formatFCFA(avgPricePerNight)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950/50">
                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                +5.2%
              </span>
              <span className="text-xs text-muted-foreground">
                vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Durée moyenne séjour */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Durée moyenne séjour
                </p>
                <p className="text-3xl font-bold">
                  {avgStayDuration} <span className="text-lg font-normal text-muted-foreground">nuits</span>
                </p>
              </div>
              <div className="rounded-lg bg-sky-100 p-2.5 dark:bg-sky-950/50">
                <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-medium text-red-500">-0.3</span>
              <span className="text-xs text-muted-foreground">
                vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Revenu par chambre */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Revenu par chambre
                </p>
                <p className="text-3xl font-bold">
                  {formatFCFA(revenuePerRoom)}
                </p>
              </div>
              <div className="rounded-lg bg-violet-100 p-2.5 dark:bg-violet-950/50">
                <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                +8.1%
              </span>
              <span className="text-xs text-muted-foreground">
                vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== BOTTOM GRID: Top Clients + Top Room Types ====== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Clients Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Top 5 Clients
            </CardTitle>
            <CardDescription>
              Clients classés par montant total dépensé
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-5">#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-center">Séjours</TableHead>
                  <TableHead className="text-right pr-5">Total dépensé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((guest, idx) => (
                  <TableRow key={guest.id}>
                    <TableCell className="pl-5">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : idx === 1
                              ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              : idx === 2
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guest.city ?? guest.country ?? '—'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {guest.totalStays}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5 font-semibold">
                      {formatFCFA(guest.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Room Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Performance par type de chambre
            </CardTitle>
            <CardDescription>
              Taux d&apos;occupation et revenus par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {ROOM_TYPE_DATA.map((rt) => (
                <div key={rt.name} className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{rt.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {rt.occupancy}% occ.
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {Math.round(rt.revenue / 1000)}K FCFA
                    </span>
                  </div>
                  {/* Horizontal bar */}
                  <div className="relative h-5 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="flex h-full items-center rounded-full transition-all duration-700"
                      style={{
                        width: `${rt.barPct}%`,
                        background: `linear-gradient(90deg, var(--chart-1), var(--primary))`,
                      }}
                    >
                      {/* Bar fill label */}
                      <span className="ml-2 text-[10px] font-bold text-primary-foreground whitespace-nowrap">
                        {rt.revenue >= 1000000
                          ? `${(rt.revenue / 1000000).toFixed(1)}M`
                          : `${Math.round(rt.revenue / 1000)}K`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-5 flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
              <BedDouble className="h-4 w-4 shrink-0" />
              <span>
                Le type <strong className="text-foreground">Suite Royale</strong> génère le plus
                de revenus avec {ROOM_TYPE_DATA[3].occupancy}% d&apos;occupation.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
