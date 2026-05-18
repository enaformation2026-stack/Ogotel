'use client'

import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import {
  formatFCFA,
  formatDateShort,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from '@/types'
import { ArrowRight, Eye } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getStatusClassName(status: ReservationStatus): string {
  return STATUS_STYLES[status] ?? ''
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return `${f}${l}`
}

// ── Animation ────────────────────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RecentReservations() {
  const reservations = MOCK_RESERVATIONS.slice(0, 5)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Dernières réservations</CardTitle>
        <CardDescription>Les 5 réservations les plus récentes</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-sm gap-1.5">
            Voir tout
            <ArrowRight className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res, i) => (
                <motion.tr
                  key={res.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
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

                  {/* Actions */}
                  <td className="px-6 py-3.5 text-center">
                    <Button variant="ghost" size="icon" className="size-8">
                      <Eye className="size-4 text-muted-foreground" />
                      <span className="sr-only">Voir la réservation</span>
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden space-y-3 px-6 pb-6">
          {reservations.map((res, i) => (
            <motion.div
              key={res.id}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:bg-muted/50"
            >
              {/* Top row: reference + status */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  {res.reference}
                </span>
                <Badge
                  variant="outline"
                  className={getStatusClassName(res.status)}
                >
                  {RESERVATION_STATUS_LABELS[res.status]}
                </Badge>
              </div>

              {/* Client */}
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(res.guest?.firstName, res.guest?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
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
              <div className="flex items-center justify-between pt-1">
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
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <Eye className="size-3.5" />
                  Voir
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
