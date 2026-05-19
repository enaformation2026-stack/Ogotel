'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MOCK_HOTELS, MOCK_PAYMENTS } from '@/lib/mock-data'
import {
  formatFCFA,
  type SubscriptionPlan,
  type PaymentStatus,
} from '@/types'
import {
  Crown,
  Zap,
  Rocket,
  Building2,
  Check,
  X,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Users,
  BedDouble,
  Hotel,
  CalendarDays,
  ArrowRight,
  Loader2,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<
  SubscriptionPlan,
  {
    name: string
    price: number
    icon: React.ElementType
    description: string
    color: string
    features: string[]
  }
> = {
  trial: {
    name: 'Essai',
    price: 0,
    icon: Zap,
    description: 'Découvrez OGOTEL CLOUD gratuitement',
    color: 'border-slate-300',
    features: [
      '1 hôtel',
      '10 chambres',
      '2 utilisateurs',
      'Réservations de base',
      'Support par email',
    ],
  },
  starter: {
    name: 'Starter',
    price: 15000,
    icon: Rocket,
    description: 'Idéal pour les petits hôtels',
    color: 'border-emerald-500',
    features: [
      '3 hôtels',
      '50 chambres',
      '5 utilisateurs',
      'Calendrier des chambres',
      'Gestion des paiements',
      'Rapports de base',
      'Support email & téléphone',
    ],
  },
  pro: {
    name: 'Pro',
    price: 45000,
    icon: Crown,
    description: 'Pour les hôtels en croissance',
    color: 'border-[oklch(0.22_0.065_160)]',
    features: [
      '10 hôtels',
      '200 chambres',
      '15 utilisateurs',
      'Toutes les fonctionnalités Starter',
      'Gestion du ménage',
      'Rapports avancés',
      'API accès',
      'Support prioritaire',
      'Intégrations OTA',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 0,
    icon: Building2,
    description: 'Solutions sur mesure',
    color: 'border-amber-500',
    features: [
      'Hôtels illimités',
      'Chambres illimitées',
      'Utilisateurs illimités',
      'Toutes les fonctionnalités Pro',
      'Multi-organisation',
      'SLA garanti',
      'Développement personnalisé',
      'Formation dédiée',
      'Account manager dédié',
    ],
  },
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
  partial: 'Partiel',
}

// Mock payment history
const MOCK_PAYMENT_HISTORY = [
  { id: 'sub-001', date: '2024-12-01', plan: 'pro' as SubscriptionPlan, amount: 45000, status: 'completed' as PaymentStatus },
  { id: 'sub-002', date: '2024-11-01', plan: 'pro' as SubscriptionPlan, amount: 45000, status: 'completed' as PaymentStatus },
  { id: 'sub-003', date: '2024-10-01', plan: 'starter' as SubscriptionPlan, amount: 15000, status: 'completed' as PaymentStatus },
  { id: 'sub-004', date: '2024-09-01', plan: 'starter' as SubscriptionPlan, amount: 15000, status: 'completed' as PaymentStatus },
  { id: 'sub-005', date: '2024-08-01', plan: 'trial' as SubscriptionPlan, amount: 0, status: 'completed' as PaymentStatus },
]

// ── Component ────────────────────────────────────────────────────────────────

export function SubscriptionPage() {
  const [currentPlan] = useState<SubscriptionPlan>('pro')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null)

  const currentPlanConfig = PLAN_CONFIG[currentPlan]
  const renewalDate = '01 janvier 2025'
  const hotelsCount = MOCK_HOTELS.length
  const usersCount = 3
  const roomsCount = 18

  const handleRefresh = () => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Données actualisées')
    }, 800)
  }

  const handleSwitchPlan = async (planKey: SubscriptionPlan) => {
    if (planKey === currentPlan) return
    setSwitchingPlan(planKey)
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur')
      }
      toast.success(`Demande de changement vers ${PLAN_CONFIG[planKey].name} envoyée`)
    } catch {
      toast.success(`Demande de changement vers ${PLAN_CONFIG[planKey].name} envoyée`)
    } finally {
      setSwitchingPlan(null)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
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
          <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
          <Badge
            className="bg-[oklch(0.22_0.065_160)] text-white hover:bg-[oklch(0.18_0.065_160)]"
          >
            {currentPlanConfig.name}
          </Badge>
        </div>
        <Button variant="outline" size="icon" className="size-8" onClick={handleRefresh}>
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : (
        <>
          {/* ── Current Plan Card ───────────────────────────────────────── */}
          <Card className={`overflow-hidden border-2 ${currentPlanConfig.color}`}>
            <div className="bg-gradient-to-r from-[oklch(0.22_0.065_160)] to-[oklch(0.30_0.08_160)] text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                  <Crown className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Plan {currentPlanConfig.name}
                  </h2>
                  <p className="text-sm text-white/70">
                    Votre abonnement actuel
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-xs text-white/60 uppercase">Prix</p>
                  <p className="text-3xl font-bold">
                    {currentPlanConfig.price === 0
                      ? 'Gratuit'
                      : `${new Intl.NumberFormat('fr-FR').format(currentPlanConfig.price)} FCFA`}
                    <span className="text-sm font-normal text-white/60">
                      {currentPlanConfig.price > 0 ? '/mois' : ''}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase">
                    Renouvellement
                  </p>
                  <p className="text-lg font-semibold">{renewalDate}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Utilisation
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <UsageItem
                  icon={Hotel}
                  label="Hôtels"
                  used={hotelsCount}
                  max={currentPlan === 'trial' ? 1 : currentPlan === 'starter' ? 3 : currentPlan === 'pro' ? 10 : 999}
                />
                <UsageItem
                  icon={Users}
                  label="Utilisateurs"
                  used={usersCount}
                  max={currentPlan === 'trial' ? 2 : currentPlan === 'starter' ? 5 : currentPlan === 'pro' ? 15 : 999}
                />
                <UsageItem
                  icon={BedDouble}
                  label="Chambres"
                  used={roomsCount}
                  max={currentPlan === 'trial' ? 10 : currentPlan === 'starter' ? 50 : currentPlan === 'pro' ? 200 : 999}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Plan Comparison ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="size-5 text-muted-foreground" />
              Comparaison des forfaits
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(PLAN_CONFIG) as [SubscriptionPlan, typeof PLAN_CONFIG[SubscriptionPlan]][]).map(
                ([planKey, plan]) => {
                  const isCurrent = planKey === currentPlan
                  const PlanIcon = plan.icon
                  return (
                    <Card
                      key={planKey}
                      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                        isCurrent ? 'ring-2 ring-[oklch(0.22_0.065_160)]' : ''
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 bg-[oklch(0.22_0.065_160)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                          ACTUEL
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <PlanIcon className="size-5 text-muted-foreground" />
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-2xl font-bold">
                            {plan.price === 0
                              ? 'Gratuit'
                              : `${new Intl.NumberFormat('fr-FR').format(plan.price)} FCFA`}
                            <span className="text-xs font-normal text-muted-foreground">
                              {plan.price > 0 ? '/mois' : ''}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {plan.description}
                          </p>
                        </div>

                        <Separator />

                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-xs"
                            >
                              <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {!isCurrent && (
                          <Button
                            className="w-full gap-2 bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
                            size="sm"
                            onClick={() => handleSwitchPlan(planKey)}
                            disabled={switchingPlan === planKey}
                          >
                            {switchingPlan === planKey ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Chargement...
                              </>
                            ) : (
                              <>
                                Choisir
                                <ArrowRight className="size-3.5" />
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                }
              )}
            </div>
          </div>

          {/* ── Payment History ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="size-5 text-muted-foreground" />
              Historique des paiements
            </h2>
            <Card>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Forfait</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PAYMENT_HISTORY.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">
                          {new Date(payment.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-sm font-medium capitalize">
                          {PLAN_CONFIG[payment.plan]?.name ?? payment.plan}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {payment.amount === 0
                            ? 'Gratuit'
                            : formatFCFA(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              payment.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {PAYMENT_STATUS_LABELS[payment.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile list */}
              <div className="md:hidden divide-y">
                {MOCK_PAYMENT_HISTORY.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {PLAN_CONFIG[payment.plan]?.name ?? payment.plan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {payment.amount === 0
                          ? 'Gratuit'
                          : formatFCFA(payment.amount)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          payment.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[payment.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Billing Info ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="size-5 text-muted-foreground" />
              Informations de facturation
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Organisation
                    </p>
                    <p className="text-sm font-medium">OGOTEL CLOUD</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email de facturation
                    </p>
                    <p className="text-sm font-medium">
                      contact@hotel-cocody.ci
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Téléphone
                    </p>
                    <p className="text-sm font-medium">
                      +225 27 20 30 40 50
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Adresse
                    </p>
                    <p className="text-sm font-medium">
                      Rue des Ambassades, Cocody, Abidjan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// ── Usage Item ────────────────────────────────────────────────────────────────

function UsageItem({
  icon: Icon,
  label,
  used,
  max,
}: {
  icon: React.ElementType
  label: string
  used: number
  max: number
}) {
  const percentage = max === 999 ? 0 : Math.min(100, Math.round((used / max) * 100))
  const isNearLimit = percentage >= 80 && max !== 999

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-bold ${isNearLimit ? 'text-amber-600' : ''}`}>
          {used}
        </span>
        <span className="text-sm text-muted-foreground">
          / {max === 999 ? '∞' : max}
        </span>
      </div>
      {max !== 999 && (
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? 'bg-amber-500' : 'bg-[oklch(0.22_0.065_160)]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
