'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { PageRouter } from '@/components/layout/PageRouter'
import { AuthPage } from '@/components/auth/AuthPage'
import { useHotelStore } from '@/stores/hotel.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { MOCK_HOTELS } from '@/lib/mock-data'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setHotels = useHotelStore((s) => s.setHotels)
  const hotels = useHotelStore((s) => s.hotels)
  const setAuthView = useUIStore((s) => s.setAuthView)

  React.useEffect(() => {
    if (isAuthenticated && hotels.length === 0) {
      setHotels(MOCK_HOTELS)
    }
  }, [isAuthenticated, hotels.length, setHotels])

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    // Default to login view
    const authView = useUIStore.getState().authView
    if (authView === null) {
      setAuthView('login')
    }
    return <AuthPage />
  }

  // Show dashboard when authenticated
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
