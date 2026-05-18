'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MOCK_PAYMENTS, MOCK_KPIS } from '@/lib/mock-data'
import {
  formatFCFA,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type PaymentStatus,
  type Payment,
} from '@/types'
import {
  Plus,
  Search,
  Banknote,
  TrendingUp,
  Clock,
  RotateCcw,
  MoreVertical,
  Eye,
  Receipt,
  Smartphone,
  CreditCard,
  Building,
} from 'lucide-react'
import { NewPaymentDialog } from '@/components/dialogs/NewPaymentDialog'
import { toast } from 'sonner'

// ==========================================
// CONFIGURATION
// ==========================================

const METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; color: string; icon: React.ElementType }
> = {
  cash: {
    label: 'Cash',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    icon: Banknote,
  },
  orange_money: {
    label: 'Orange Money',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    icon: Smartphone,
  },
  mtn_money: {
    label: 'MTN Money',
    color:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
    icon: Smartphone,
  },
  wave: {
    label: 'Wave',
    color:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    icon: Smartphone,
  },
  moov_money: {
    label: 'Moov Money',
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    icon: Smartphone,
  },
  card: {
    label: 'Carte',
    color:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    icon: CreditCard,
  },
  bank_transfer: {
    label: 'Virement',
    color:
      'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
    icon: Building,
  },
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
  partial: 'Partiel',
}

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  completed:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  pending:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  failed:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  refunded:
    'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  partial:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
}

const AMOUNT_STATUS_STYLES: Record<PaymentStatus, string> = {
  completed: 'text-foreground',
  pending: 'text-amber-600 dark:text-amber-400',
  failed: 'text-red-600 dark:text-red-400',
  refunded: 'text-muted-foreground line-through',
  partial: 'text-blue-600 dark:text-blue-400',
}

const FILTER_METHODS: Array<{ value: 'all' | PaymentMethod; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'cash', label: 'Cash' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_money', label: 'MTN Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'card', label: 'Carte' },
]

const FILTER_STATUSES: Array<{ value: 'all' | PaymentStatus; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'completed', label: 'Complété' },
  { value: 'pending', label: 'En attente' },
  { value: 'refunded', label: 'Remboursé' },
  { value: 'failed', label: 'Échoué' },
]

// ==========================================
// HELPERS
// ==========================================

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ==========================================
// STATS CARDS
// ==========================================

const STATS = [
  {
    label: 'Revenus du jour',
    value: '320 000 FCFA',
    icon: Banknote,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    watermarkColor: 'text-emerald-500',
  },
  {
    label: 'Revenus du mois',
    value: '1 248 000 FCFA',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    watermarkColor: 'text-emerald-500',
  },
  {
    label: 'En attente',
    value: '65 000 FCFA',
    icon: Clock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    watermarkColor: 'text-amber-500',
  },
  {
    label: 'Remboursements',
    value: '0 FCFA',
    icon: RotateCcw,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    watermarkColor: 'text-red-500',
  },
]

function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="relative overflow-hidden p-4">
            <div className="pointer-events-none absolute right-2 top-2">
              <Icon
                className={`h-14 w-14 ${stat.watermarkColor} opacity-[0.07]`}
              />
            </div>
            <CardContent className="relative flex flex-col gap-2 p-0">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
              <p className="text-lg font-bold tracking-tight sm:text-xl">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==========================================
// METHOD BADGE
// ==========================================

function MethodBadge({ method }: { method: PaymentMethod }) {
  const config = METHOD_CONFIG[method]
  if (!config) return null
  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

// ==========================================
// DESKTOP TABLE
// ==========================================

function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <Banknote className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          Aucun paiement trouvé
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Essayez de modifier vos filtres
        </p>
      </div>
    )
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Référence
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Client / Réservation
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Montant
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Méthode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="transition-colors hover:bg-muted/30"
            >
              {/* Référence */}
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {payment.reference}
                </span>
              </td>

              {/* Client + Réservation */}
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">
                    {payment.reservation?.guest
                      ? `${payment.reservation.guest.firstName} ${payment.reservation.guest.lastName}`
                      : 'Client inconnu'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.reservation?.reference ?? payment.reservationId}
                  </p>
                </div>
              </td>

              {/* Montant */}
              <td className="px-4 py-3 text-right">
                <span
                  className={`font-semibold ${AMOUNT_STATUS_STYLES[payment.status]}`}
                >
                  {formatFCFA(payment.amount)}
                </span>
              </td>

              {/* Méthode */}
              <td className="px-4 py-3">
                <MethodBadge method={payment.method} />
              </td>

              {/* Date */}
              <td className="px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(payment.paidAt)}
                </span>
              </td>

              {/* Statut */}
              <td className="px-4 py-3">
                <StatusBadge status={payment.status} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir reçu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Rembourser
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==========================================
// MOBILE CARDS
// ==========================================

function PaymentsCards({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 md:hidden">
        <Banknote className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          Aucun paiement trouvé
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Essayez de modifier vos filtres
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {payments.map((payment) => (
        <Card key={payment.id} className="p-4">
          <CardContent className="space-y-3 p-0">
            {/* Top row: ref + status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-muted-foreground">
                  {payment.reference}
                </span>
                <p className="mt-0.5 font-medium">
                  {payment.reservation?.guest
                    ? `${payment.reservation.guest.firstName} ${payment.reservation.guest.lastName}`
                    : 'Client inconnu'}
                </p>
              </div>
              <StatusBadge status={payment.status} />
            </div>

            {/* Reservation ref */}
            {payment.reservation?.reference && (
              <p className="text-xs text-muted-foreground">
                Réservation : {payment.reservation.reference}
              </p>
            )}

            {/* Amount + Method row */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-lg font-bold ${AMOUNT_STATUS_STYLES[payment.status]}`}
              >
                {formatFCFA(payment.amount)}
              </span>
              <MethodBadge method={payment.method} />
            </div>

            {/* Date + Actions */}
            <div className="flex items-center justify-between gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">
                {formatDateTime(payment.paidAt)}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  Reçu
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-red-600 dark:text-red-400"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Rembourser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ==========================================
// FILTER SECTION
// ==========================================

function FilterBar({
  methodFilter,
  setMethodFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: {
  methodFilter: 'all' | PaymentMethod
  setMethodFilter: (v: 'all' | PaymentMethod) => void
  statusFilter: 'all' | PaymentStatus
  setStatusFilter: (v: 'all' | PaymentStatus) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      {/* Method filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Méthode :
        </span>
        {FILTER_METHODS.map((f) => (
          <Button
            key={f.value}
            variant={methodFilter === f.value ? 'default' : 'outline'}
            size="sm"
            className={`h-8 text-xs ${
              methodFilter === f.value ? '' : 'border-border/60'
            }`}
            onClick={() => setMethodFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Statut :
        </span>
        {FILTER_STATUSES.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            className={`h-8 text-xs ${
              statusFilter === f.value ? '' : 'border-border/60'
            }`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Référence, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PaymentsPage() {
  const [methodFilter, setMethodFilter] = React.useState<
    'all' | PaymentMethod
  >('all')
  const [statusFilter, setStatusFilter] = React.useState<
    'all' | PaymentStatus
  >('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showNewDialog, setShowNewDialog] = React.useState(false)

  // Filter payments
  const filteredPayments = React.useMemo(() => {
    return MOCK_PAYMENTS.filter((payment) => {
      // Method filter
      if (methodFilter !== 'all' && payment.method !== methodFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesRef = payment.reference.toLowerCase().includes(q)
        const matchesGuest = payment.reservation?.guest
          ? `${payment.reservation.guest.firstName} ${payment.reservation.guest.lastName}`
              .toLowerCase()
              .includes(q)
          : false
        const matchesResRef = payment.reservation?.reference
          ?.toLowerCase()
          .includes(q)
        if (!matchesRef && !matchesGuest && !matchesResRef) {
          return false
        }
      }

      return true
    })
  }, [methodFilter, statusFilter, searchQuery])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Paiements & Caisse
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez les paiements et suivez les encaissements
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4">
        <FilterBar
          methodFilter={methodFilter}
          setMethodFilter={setMethodFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPayments.length} paiement{filteredPayments.length !== 1 ? 's' : ''} trouvé{filteredPayments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Payments Table (Desktop) + Cards (Mobile) */}
      <PaymentsTable payments={filteredPayments} />
      <PaymentsCards payments={filteredPayments} />

      {/* New Payment Dialog */}
      <NewPaymentDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => setShowNewDialog(false)}
      />
    </div>
  )
}
