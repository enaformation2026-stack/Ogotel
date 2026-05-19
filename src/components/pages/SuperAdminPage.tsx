'use client'

import * as React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useAuthStore } from '@/stores/auth.store'
import { formatFCFA, type SubscriptionPlan, type SubscriptionStatus } from '@/types'
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  Power,
  Trash2,
  AlertCircle,
  RefreshCw,
  Building2,
  Users,
  Hotel,
  TrendingUp,
  Shield,
  Clock,
  Activity,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// ── Mock Data ────────────────────────────────────────────────────────────────

interface OrgData {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  country: string
  plan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  maxHotels: number
  maxUsers: number
  hotelsCount: number
  usersCount: number
  revenue: number
  createdAt: string
  isActive: boolean
}

const MOCK_ORGS: OrgData[] = [
  {
    id: 'org-001',
    name: 'Hôtel Le Cocody',
    email: 'contact@hotel-cocody.ci',
    phone: '+225 27 20 30 40 50',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    plan: 'pro',
    subscriptionStatus: 'active',
    maxHotels: 10,
    maxUsers: 15,
    hotelsCount: 3,
    usersCount: 5,
    revenue: 4_500_000,
    createdAt: '2024-01-15',
    isActive: true,
  },
  {
    id: 'org-002',
    name: 'Résidence Yopougon',
    email: 'info@residence-yop.ci',
    phone: '+225 07 10 20 30',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    plan: 'starter',
    subscriptionStatus: 'active',
    maxHotels: 3,
    maxUsers: 5,
    hotelsCount: 1,
    usersCount: 2,
    revenue: 850_000,
    createdAt: '2024-03-22',
    isActive: true,
  },
  {
    id: 'org-003',
    name: 'Paradis Beach Hotel',
    email: 'contact@paradis-beach.com',
    city: 'Grand-Bassam',
    country: "Côte d'Ivoire",
    plan: 'pro',
    subscriptionStatus: 'expired',
    maxHotels: 10,
    maxUsers: 15,
    hotelsCount: 2,
    usersCount: 8,
    revenue: 3_200_000,
    createdAt: '2024-02-10',
    isActive: false,
  },
  {
    id: 'org-004',
    name: 'Hôtel Palm Club',
    email: 'palm@club.ci',
    phone: '+225 01 50 60 70',
    city: 'San Pedro',
    country: "Côte d'Ivoire",
    plan: 'enterprise',
    subscriptionStatus: 'active',
    maxHotels: 999,
    maxUsers: 999,
    hotelsCount: 5,
    usersCount: 20,
    revenue: 12_800_000,
    createdAt: '2023-11-01',
    isActive: true,
  },
  {
    id: 'org-005',
    name: 'Dakar Suites',
    email: 'info@dakar-suites.sn',
    phone: '+221 77 80 90 00',
    city: 'Dakar',
    country: 'Sénégal',
    plan: 'trial',
    subscriptionStatus: 'active',
    maxHotels: 1,
    maxUsers: 2,
    hotelsCount: 1,
    usersCount: 1,
    revenue: 120_000,
    createdAt: '2024-12-01',
    isActive: true,
  },
  {
    id: 'org-006',
    name: 'Bamako Inn',
    email: 'reservations@bamako-inn.ml',
    phone: '+223 70 10 20 30',
    city: 'Bamako',
    country: 'Mali',
    plan: 'starter',
    subscriptionStatus: 'suspended',
    maxHotels: 3,
    maxUsers: 5,
    hotelsCount: 1,
    usersCount: 3,
    revenue: 0,
    createdAt: '2024-06-15',
    isActive: false,
  },
]

const MOCK_ACTIVITY = [
  { id: '1', text: 'Hôtel Le Cocody a mis à jour son abonnement Pro', time: 'Il y a 2 heures', icon: '💳' },
  { id: '2', text: 'Nouvelle organisation inscrite : Dakar Suites', time: 'Il y a 5 heures', icon: '🆕' },
  { id: '3', text: 'Paradis Beach Hotel — Abonnement expiré', time: 'Il y a 1 jour', icon: '⚠️' },
  { id: '4', text: 'Hôtel Palm Club a ajouté 2 nouveaux hôtels', time: 'Il y a 2 jours', icon: '🏨' },
  { id: '5', text: 'Résidence Yopougon — 15 nouvelles réservations', time: 'Il y a 3 jours', icon: '📋' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLAN_BADGES: Record<SubscriptionPlan, string> = {
  trial: 'bg-slate-100 text-slate-700 border-slate-200',
  starter: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pro: 'bg-[oklch(0.22_0.065_160)]/10 text-[oklch(0.22_0.065_160)] border-[oklch(0.22_0.065_160)]/30',
  enterprise: 'bg-amber-100 text-amber-700 border-amber-200',
}

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  trial: 'Essai',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const STATUS_BADGES: Record<SubscriptionStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_payment: 'bg-blue-50 text-blue-700 border-blue-200',
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Actif',
  expired: 'Expiré',
  suspended: 'Suspendu',
  cancelled: 'Annulé',
  pending_payment: 'En attente',
}

type PlanFilter = 'all' | SubscriptionPlan

const PLAN_FILTERS: { key: PlanFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'trial', label: 'Essai' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'enterprise', label: 'Enterprise' },
]

// ── Animation ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ── Component ────────────────────────────────────────────────────────────────

export function SuperAdminPage() {
  const profile = useAuthStore((s) => s.profile)

  const [orgs, setOrgs] = useState<OrgData[]>(MOCK_ORGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrgData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Computed stats (must be before conditional return for hooks rules)
  const stats = useMemo(() => ({
    totalOrgs: orgs.length,
    totalHotels: orgs.reduce((sum, o) => sum + o.hotelsCount, 0),
    totalUsers: orgs.reduce((sum, o) => sum + o.usersCount, 0),
    totalRevenue: orgs.reduce((sum, o) => sum + o.revenue, 0),
  }), [orgs])

  // Filtered orgs
  const filteredOrgs = useMemo(() => {
    let result = orgs
    if (planFilter !== 'all') {
      result = result.filter((o) => o.plan === planFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          (o.city ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [orgs, planFilter, searchQuery])

  const paginatedOrgs = useMemo(() => {
    const start = page * pageSize
    return filteredOrgs.slice(start, start + pageSize)
  }, [filteredOrgs, page])

  const totalPages = Math.ceil(filteredOrgs.length / pageSize)

  // Access control
  if (profile && profile.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="mb-4 size-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Accès restreint
        </h2>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>
    )
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Données actualisées')
    }, 800)
  }

  const handleToggleActive = async (org: OrgData) => {
    const newStatus = !org.isActive
    setOrgs((prev) =>
      prev.map((o) => (o.id === org.id ? { ...o, isActive: newStatus } : o))
    )
    toast.success(
      newStatus
        ? `"${org.name}" réactivé`
        : `"${org.name}" suspendu`
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setTimeout(() => {
      setOrgs((prev) => prev.filter((o) => o.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.name}" supprimé`)
      setDeleteTarget(null)
      setIsDeleting(false)
    }, 600)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
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
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <Badge className="bg-[oklch(0.22_0.065_160)] text-white">Super Admin</Badge>
        </div>
        <Button variant="outline" size="icon" className="size-8" onClick={handleRefresh}>
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.22_0.065_160)]/10">
                <Building2 className="size-4 text-[oklch(0.22_0.065_160)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Organisations</p>
                <p className="text-lg font-bold tabular-nums leading-tight">{stats.totalOrgs}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <Hotel className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Hôtels</p>
                <p className="text-lg font-bold tabular-nums leading-tight">{stats.totalHotels}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Users className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Utilisateurs</p>
                <p className="text-lg font-bold tabular-nums leading-tight">{stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Revenu total</p>
                <p className="text-lg font-bold tabular-nums leading-tight">
                  {formatFCFA(stats.totalRevenue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PLAN_FILTERS.map((tab) => {
            const isActive = planFilter === tab.key
            return (
              <Button
                key={tab.key}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`shrink-0 gap-1.5 text-sm ${isActive ? '' : 'text-muted-foreground'}`}
                onClick={() => {
                  setPlanFilter(tab.key)
                  setPage(0)
                }}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, ville..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* ── Organizations Table ────────────────────────────────────────── */}
      {isLoading ? (
        <Card>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : filteredOrgs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Building2 className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            Aucune organisation trouvée
          </p>
          <p className="text-sm text-muted-foreground/70">
            Essayez de modifier vos filtres.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">Organisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">Forfait</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide">Hôtels</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide">Revenu</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrgs.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{org.name}</span>
                          <span className="text-xs text-muted-foreground">{org.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {[org.city, org.country].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className={`text-[11px] ${PLAN_BADGES[org.plan]}`}>
                          {PLAN_LABELS[org.plan]}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className={`text-[11px] ${STATUS_BADGES[org.subscriptionStatus]}`}>
                          {STATUS_LABELS[org.subscriptionStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium tabular-nums">
                        {org.hotelsCount}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold">
                        {formatFCFA(org.revenue)}
                      </td>
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
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onSelect={() => handleToggleActive(org)}
                            >
                              {org.isActive ? (
                                <>
                                  <Ban className="size-4" />
                                  Suspendre
                                </>
                              ) : (
                                <>
                                  <Power className="size-4" />
                                  Réactiver
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                              onSelect={() => setDeleteTarget(org)}
                            >
                              <Trash2 className="size-4" />
                              Supprimer
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
            <div className="lg:hidden divide-y">
              {paginatedOrgs.map((org) => (
                <div key={org.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{org.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{org.email}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0">
                          <MoreVertical className="size-4 text-muted-foreground" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="size-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onSelect={() => handleToggleActive(org)}
                        >
                          {org.isActive ? (
                            <>
                              <Ban className="size-4" />
                              Suspendre
                            </>
                          ) : (
                            <>
                              <Power className="size-4" />
                              Réactiver
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          onSelect={() => setDeleteTarget(org)}
                        >
                          <Trash2 className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${PLAN_BADGES[org.plan]}`}>
                      {PLAN_LABELS[org.plan]}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_BADGES[org.subscriptionStatus]}`}>
                      {STATUS_LABELS[org.subscriptionStatus]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {org.hotelsCount} hôtel(s) · {formatFCFA(org.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Recent Activity ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Activity className="size-4" />
          Activité récente
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {MOCK_ACTIVITY.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-lg shrink-0">{activity.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Delete Dialog ──────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-red-500" />
              Supprimer l&apos;organisation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>{' '}
              ? Cette action est irréversible. Toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
