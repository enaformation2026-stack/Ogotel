'use client'

import * as React from 'react'
import { useUIStore, type ActivePage } from '@/stores/ui.store'

// Pages modules
import { DashboardPage } from '@/components/pages/DashboardPage'
import { ReservationsPage } from '@/components/pages/ReservationsPage'
import { RoomsPage } from '@/components/pages/RoomsPage'
import { GuestsPage } from '@/components/pages/GuestsPage'
import { PaymentsPage } from '@/components/pages/PaymentsPage'
import { ReportsPage } from '@/components/pages/ReportsPage'
import { StaffPage } from '@/components/pages/StaffPage'
import { HotelsPage } from '@/components/pages/HotelsPage'
import { RoomTypesPage } from '@/components/pages/RoomTypesPage'
import { SettingsPage } from '@/components/pages/SettingsPage'

// Mapping page -> composant
const PAGE_COMPONENTS: Record<ActivePage, React.ComponentType> = {
  dashboard: DashboardPage,
  hotels: HotelsPage,
  reservations: ReservationsPage,
  rooms: RoomsPage,
  'room-types': RoomTypesPage,
  guests: GuestsPage,
  payments: PaymentsPage,
  reports: ReportsPage,
  staff: StaffPage,
  settings: SettingsPage,
  'settings-hotel': SettingsPage,
  'settings-subscription': SettingsPage,
  'settings-account': SettingsPage,
}

export function PageRouter() {
  const activePage = useUIStore((s) => s.activePage)
  const PageComponent = PAGE_COMPONENTS[activePage]

  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Page non trouvée</p>
      </div>
    )
  }

  return (
    <React.Suspense fallback={<PageSkeleton />}>
      <PageComponent />
    </React.Suspense>
  )
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-1">
      <div className="space-y-2">
        <div className="h-8 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
