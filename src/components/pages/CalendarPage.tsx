'use client'

import * as React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MOCK_ROOMS, MOCK_RESERVATIONS } from '@/lib/mock-data'
import {
  formatDateShort,
  RESERVATION_STATUS_LABELS,
  formatFCFA,
  type ReservationStatus,
  type Reservation,
  type Room,
} from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  BedDouble,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'bg-amber-400 dark:bg-amber-500',
  confirmed: 'bg-emerald-500 dark:bg-emerald-600',
  checked_in: 'bg-blue-500 dark:bg-blue-600',
  checked_out: 'bg-slate-400 dark:bg-slate-500',
  cancelled: 'bg-red-400 dark:bg-red-500',
  no_show: 'bg-orange-400 dark:bg-orange-500',
}

const STATUS_TEXT_COLORS: Record<ReservationStatus, string> = {
  pending: 'text-amber-900 dark:text-amber-100',
  confirmed: 'text-emerald-900 dark:text-emerald-100',
  checked_in: 'text-blue-900 dark:text-blue-100',
  checked_out: 'text-slate-900 dark:text-slate-100',
  cancelled: 'text-red-900 dark:text-red-100',
  no_show: 'text-orange-900 dark:text-orange-100',
}

const DAYS_TO_SHOW = 14

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

function overlapDays(
  resStart: string,
  resEnd: string,
  rangeStart: string,
  rangeEnd: string
): { start: number; span: number } | null {
  const s1 = new Date(resStart).getTime()
  const e1 = new Date(resEnd).getTime()
  const s2 = new Date(rangeStart).getTime()
  const e2 = new Date(rangeEnd).getTime()

  const overlapStart = Math.max(s1, s2)
  const overlapEnd = Math.min(e1, e2)

  if (overlapStart >= overlapEnd) return null

  const offsetDays = Math.round((overlapStart - s2) / (1000 * 60 * 60 * 24))
  const spanDays = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24))

  return { start: offsetDays, span: spanDays }
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalendarReservation extends Reservation {
  _overlap?: { start: number; span: number }
}

interface CalendarPageProps {
  onReservationClick?: (reservation: Reservation) => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function CalendarPage({ onReservationClick }: CalendarPageProps) {
  const isMobile = useIsMobile()
  const [rangeStart, setRangeStart] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    return d
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rangeEnd = useMemo(() => addDays(rangeStart, DAYS_TO_SHOW), [rangeStart])

  const dayHeaders = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const d = addDays(rangeStart, i)
      return {
        date: d,
        label: isMobile
          ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
          : d.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
        dateOnly: toDateOnly(d),
        isToday: isToday(d),
      }
    })
  }, [rangeStart, isMobile])

  const rangeStartStr = toDateOnly(rangeStart)
  const rangeEndStr = toDateOnly(rangeEnd)

  // Sort rooms by number
  const rooms = useMemo(() => {
    return [...MOCK_ROOMS].sort((a, b) => a.number.localeCompare(b.number))
  }, [])

  // Map reservations to rooms and compute overlaps
  const reservationsByRoom = useMemo(() => {
    const map: Record<string, CalendarReservation[]> = {}
    for (const room of rooms) {
      map[room.id] = []
    }
    for (const res of MOCK_RESERVATIONS) {
      if (res.status === 'cancelled') continue
      const overlap = overlapDays(
        res.checkInDate,
        res.checkOutDate,
        rangeStartStr,
        rangeEndStr
      )
      if (overlap) {
        if (!map[res.roomId]) map[res.roomId] = []
        map[res.roomId].push({ ...res, _overlap: overlap })
      }
    }
    return map
  }, [rooms, rangeStartStr, rangeEndStr])

  // Mobile: group all reservations for the date range
  const mobileReservations = useMemo(() => {
    const result: CalendarReservation[] = []
    for (const res of MOCK_RESERVATIONS) {
      if (res.status === 'cancelled') continue
      const overlap = overlapDays(
        res.checkInDate,
        res.checkOutDate,
        rangeStartStr,
        rangeEndStr
      )
      if (overlap) {
        result.push({ ...res, _overlap: overlap })
      }
    }
    return result
  }, [rangeStartStr, rangeEndStr])

  const goToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    setRangeStart(d)
  }

  const goPrev = () => setRangeStart((prev) => addDays(prev, -7))
  const goNext = () => setRangeStart((prev) => addDays(prev, 7))

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Calendrier actualisé')
    }, 800)
  }, [])

  const handleReservationClick = (res: Reservation) => {
    if (onReservationClick) {
      onReservationClick(res)
    } else {
      toast.info(
        `${res.reference} — ${res.guest?.firstName ?? ''} ${res.guest?.lastName ?? ''}`
      )
    }
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          </div>
        </div>
        <Card className="flex flex-col items-center justify-center p-12">
          <AlertCircle className="mb-3 size-10 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => {
              setError(null)
              handleRefresh()
            }}
          >
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
          <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          <div className="flex items-center gap-1">
            <Layers className="size-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-sm font-semibold tabular-nums">
              {rooms.length} chambres
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={goPrev}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={goToday}
            >
              Aujourd&apos;hui
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={goNext}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="size-8" onClick={handleRefresh}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(RESERVATION_STATUS_LABELS) as [ReservationStatus, string][]).map(
          ([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={`inline-block size-2.5 rounded-sm ${STATUS_COLORS[status]}`}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          )
        )}
      </div>

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* ── Mobile Card List ─────────────────────────────────────────── */
        <div className="space-y-3">
          {mobileReservations.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12">
              <CalendarDays className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucune réservation sur cette période
              </p>
              <p className="text-sm text-muted-foreground/70">
                Essayez de changer la période affichée.
              </p>
            </Card>
          ) : (
            mobileReservations.map((res) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md border-l-4"
                  style={{
                    borderLeftColor:
                      STATUS_COLORS[res.status] === 'bg-amber-400'
                        ? '#fbbf24'
                        : STATUS_COLORS[res.status] === 'bg-emerald-500'
                          ? '#10b981'
                          : STATUS_COLORS[res.status] === 'bg-blue-500'
                            ? '#3b82f6'
                            : STATUS_COLORS[res.status] === 'bg-slate-400'
                              ? '#94a3b8'
                              : STATUS_COLORS[res.status] === 'bg-red-400'
                                ? '#f87171'
                                : '#fb923c',
                  }}
                  onClick={() => handleReservationClick(res)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {res.reference}
                      </span>
                      <Badge
                        variant="outline"
                        className={STATUS_TEXT_COLORS[res.status]}
                        style={{ backgroundColor: 'transparent' }}
                      >
                        {RESERVATION_STATUS_LABELS[res.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {res.guest?.firstName} {res.guest?.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <BedDouble className="size-3.5" />
                        {res.room?.number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatDateShort(res.checkInDate)} &rarr;{' '}
                        {formatDateShort(res.checkOutDate)}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatFCFA(res.totalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* ── Desktop Gantt Grid ────────────────────────────────────────── */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Day headers */}
              <div className="flex border-b bg-muted/30 sticky top-0 z-10">
                <div className="w-36 shrink-0 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r">
                  Chambre
                </div>
                {dayHeaders.map((day) => (
                  <div
                    key={day.dateOnly}
                    className={`flex-1 min-w-[72px] px-2 py-2 text-center border-r last:border-r-0 ${
                      day.isToday
                        ? 'bg-[oklch(0.22_0.065_160)]/5'
                        : ''
                    }`}
                  >
                    <span
                      className={`text-[11px] leading-tight ${
                        day.isToday
                          ? 'text-[oklch(0.22_0.065_160)] font-bold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {day.label}
                    </span>
                    {day.isToday && (
                      <div className="mx-auto mt-1 size-1.5 rounded-full bg-[oklch(0.22_0.065_160)]" />
                    )}
                  </div>
                ))}
              </div>

              {/* Room rows */}
              {rooms.map((room) => {
                const roomReservations = reservationsByRoom[room.id] ?? []
                return (
                  <div
                    key={room.id}
                    className="flex border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Room label */}
                    <div className="w-36 shrink-0 px-3 py-2 border-r flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-bold">
                        {room.number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {room.roomType?.name ?? '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFCFA(room.priceOverride ?? room.roomType?.basePrice ?? 0)}/n
                        </p>
                      </div>
                    </div>

                    {/* Day cells */}
                    <div className="flex-1 relative grid grid-cols-14" style={{ gridTemplateColumns: `repeat(${DAYS_TO_SHOW}, 1fr)` }}>
                      {/* Grid lines */}
                      {dayHeaders.map((day) => (
                        <div
                          key={day.dateOnly}
                          className={`border-r last:border-r-0 min-h-[52px] ${
                            day.isToday ? 'bg-[oklch(0.22_0.065_160)]/5' : ''
                          }`}
                        />
                      ))}

                      {/* Reservation blocks */}
                      {roomReservations.map((res) => {
                        if (!res._overlap) return null
                        const { start, span } = res._overlap
                        return (
                          <div
                            key={res.id}
                            className={`absolute top-1.5 rounded-md px-2 py-1 text-[11px] font-medium cursor-pointer transition-all hover:brightness-90 hover:shadow-md overflow-hidden z-[1] ${STATUS_COLORS[res.status]} ${STATUS_TEXT_COLORS[res.status]}`}
                            style={{
                              left: `${(start / DAYS_TO_SHOW) * 100}%`,
                              width: `${(span / DAYS_TO_SHOW) * 100}%`,
                              minWidth: '32px',
                            }}
                            title={`${res.reference} — ${res.guest?.firstName ?? ''} ${res.guest?.lastName ?? ''}\n${res.checkInDate} → ${res.checkOutDate} (${res.nights} nuits)\n${formatFCFA(res.totalAmount)}`}
                            onClick={() => handleReservationClick(res)}
                          >
                            <span className="block truncate leading-tight font-semibold">
                              {res.guest?.firstName} {res.guest?.lastName}
                            </span>
                            {span >= 2 && (
                              <span className="block truncate leading-tight opacity-80">
                                {res.nights}n — {formatFCFA(res.totalAmount)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
