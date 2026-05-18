'use client'

import * as React from 'react'
import { DashboardSidebar } from '@/components/layout/AppSidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { KPICards } from '@/components/dashboard/KPICards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { PaymentMethodsChart } from '@/components/dashboard/PaymentMethodsChart'
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid'
import RecentReservations from '@/components/dashboard/RecentReservations'
import { useHotelStore } from '@/stores/hotel.store'
import { MOCK_HOTELS } from '@/lib/mock-data'

export default function Home() {
  const setHotels = useHotelStore((s) => s.setHotels)
  const hotels = useHotelStore((s) => s.hotels)
  const activeHotel = useHotelStore((s) => s.activeHotel)

  React.useEffect(() => {
    if (hotels.length === 0) {
      setHotels(MOCK_HOTELS)
    }
  }, [hotels.length, setHotels])

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const hour = today.getHours()
  const greeting = hour >= 17 ? 'Bonsoir' : hour < 6 ? 'Bonne nuit' : 'Bonjour'

  return (
    <DashboardSidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Section bienvenue */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {greeting}, Mamadou 👋
              </h1>
              <p className="text-muted-foreground">
                {dateStr}
                {activeHotel && (
                  <>
                    {' · '}
                    <span className="font-medium text-foreground">
                      {activeHotel.name}
                    </span>
                    {' — '}
                    {activeHotel.city}
                    {activeHotel.stars
                      ? ` · ${'★'.repeat(activeHotel.stars)}`
                      : ''}
                  </>
                )}
              </p>
            </div>

            {/* KPI Cards */}
            <KPICards />

            {/* Graphiques + Disponibilité */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div className="lg:col-span-1">
                <RoomStatusGrid />
              </div>
            </div>

            {/* Réservations + Paiements */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentReservations />
              </div>
              <div className="lg:col-span-1">
                <PaymentMethodsChart />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </DashboardSidebar>
  )
}
