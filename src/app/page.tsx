'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { PageRouter } from '@/components/layout/PageRouter'
import { AuthPage } from '@/components/auth/AuthPage'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { useHotelStore } from '@/stores/hotel.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { MOCK_HOTELS } from '@/lib/mock-data'
import type { OnboardingData } from '@/components/onboarding/OnboardingWizard'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setHotels = useHotelStore((s) => s.setHotels)
  const hotels = useHotelStore((s) => s.hotels)
  const setAuthView = useUIStore((s) => s.setAuthView)
  const addHotel = useHotelStore((s) => s.addHotel)
  const setActivePage = useUIStore((s) => s.setActivePage)
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated && hotels.length === 0) {
      setHotels(MOCK_HOTELS)
    }
  }, [isAuthenticated, hotels.length, setHotels])

  // Show onboarding for new users who just registered
  React.useEffect(() => {
    if (isAuthenticated) {
      const hasSeenOnboarding = localStorage.getItem('ogotel-onboarding-done')
      if (!hasSeenOnboarding) {
        // Only show for fresh accounts (no real hotels yet)
        // For demo mode, we have mock hotels so skip
        const isNewUser = useAuthStore.getState().profile?.id === 'usr-new'
        if (isNewUser) {
          setShowOnboarding(true)
        }
      }
    }
  }, [isAuthenticated])

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem('ogotel-onboarding-done', 'true')
    setShowOnboarding(false)
    // Refresh hotels data and navigate to hotels page
    setActivePage('hotels')
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem('ogotel-onboarding-done', 'true')
    setShowOnboarding(false)
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    // Default to login view
    const authView = useUIStore.getState().authView
    if (authView === null) {
      setAuthView('login')
    }
    return <AuthPage />
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          showOnboarding={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <DashboardSidebar>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <PageRouter />
          </main>
        </SidebarInset>
      </DashboardSidebar>
    </>
  )
}
