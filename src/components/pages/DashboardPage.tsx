'use client'

import * as React from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { PaymentMethodsChart } from '@/components/dashboard/PaymentMethodsChart'
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid'
import RecentReservations from '@/components/dashboard/RecentReservations'
import { useHotelStore } from '@/stores/hotel.store'
import { MOCK_HOTELS } from '@/lib/mock-data'

export function DashboardPage() {
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
              {activeHotel.stars ? ` · ${'★'.repeat(activeHotel.stars)}` : ''}
            </>
          )}
        </p>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <RoomStatusGrid />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentReservations />
        </div>
        <div className="lg:col-span-1">
          <PaymentMethodsChart />
        </div>
      </div>
    </div>
  )
}
