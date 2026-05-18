'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { PageRouter } from '@/components/layout/PageRouter'
import { useHotelStore } from '@/stores/hotel.store'
import { MOCK_HOTELS } from '@/lib/mock-data'

export default function Home() {
  const setHotels = useHotelStore((s) => s.setHotels)
  const hotels = useHotelStore((s) => s.hotels)

  React.useEffect(() => {
    if (hotels.length === 0) {
      setHotels(MOCK_HOTELS)
    }
  }, [hotels.length, setHotels])

  return (
    <DashboardSidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <PageRouter />
        </main>
      </SidebarInset>
    </DashboardSidebar>
  )
}
