'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  BedDouble,
  CalendarDays,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_KPIS } from '@/lib/mock-data'
import { formatFCFA } from '@/types'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export function KPICards() {
  const kpis = MOCK_KPIS

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-3 top-3">
            <DollarSign className="h-16 w-16 text-emerald-500 opacity-[0.07]" />
          </div>
          <CardContent className="relative flex flex-col gap-3 p-0">
            <p className="text-sm font-medium text-muted-foreground">
              Revenus du mois
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatFCFA(kpis.revenue)}
            </p>
            <div className="flex items-center gap-1">
              {kpis.revenueChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  kpis.revenueChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {kpis.revenueChange >= 0 ? '+' : ''}
                {kpis.revenueChange}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs mois dernier
              </span>
            </div>
            {/* Mini sparkline bars */}
            <div className="flex items-end gap-0.5 pt-1">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 95, 100].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-emerald-500/20"
                    style={{ height: `${h}%`, minHeight: '3px', maxHeight: '24px' }}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Occupancy Card */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-3 top-3">
            <BedDouble className="h-16 w-16 text-blue-500 opacity-[0.07]" />
          </div>
          <CardContent className="relative flex flex-col gap-3 p-0">
            <p className="text-sm font-medium text-muted-foreground">
              Taux d&apos;occupation
            </p>
            <p className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {kpis.occupancyRate}%
            </p>
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-500/15">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${kpis.occupancyRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.occupiedRooms} chambres sur {kpis.totalRooms} occupées
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Reservations Card */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-3 top-3">
            <CalendarDays className="h-16 w-16 text-amber-500 opacity-[0.07]" />
          </div>
          <CardContent className="relative flex flex-col gap-3 p-0">
            <p className="text-sm font-medium text-muted-foreground">
              Réservations actives
            </p>
            <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {kpis.activeReservations}
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  {kpis.arrivalsToday} arrivées aujourd&apos;hui
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDownRight className="h-3 w-3 text-red-400" />
                <span className="text-xs text-muted-foreground">
                  {kpis.departuresToday} départs aujourd&apos;hui
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Clients Card */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-3 top-3">
            <Users className="h-16 w-16 text-violet-500 opacity-[0.07]" />
          </div>
          <CardContent className="relative flex flex-col gap-3 p-0">
            <p className="text-sm font-medium text-muted-foreground">
              Clients du mois
            </p>
            <p className="text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
              {kpis.uniqueGuests}
            </p>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-violet-400" />
              <span className="text-xs text-muted-foreground">
                {kpis.loyalGuests} clients fidèles (2+ séjours)
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
