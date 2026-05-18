'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { KPICards } from '@/components/dashboard/KPICards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { PaymentMethodsChart } from '@/components/dashboard/PaymentMethodsChart'
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid'
import RecentReservations from '@/components/dashboard/RecentReservations'
import { useHotelStore } from '@/stores/hotel.store'
import { MOCK_HOTELS } from '@/lib/mock-data'

// Initialise les données mock des hôtels au premier rendu
function useInitializeStore() {
  const setHotels = useHotelStore((s) => s.setHotels)
  const hotels = useHotelStore((s) => s.hotels)

  React.useEffect(() => {
    if (hotels.length === 0) {
      setHotels(MOCK_HOTELS)
    }
  }, [hotels.length, setHotels])
}

export default function Home() {
  useInitializeStore()

  // Animation d'entrée pour le contenu principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.15, duration: 0.4, ease: 'easeOut' },
    },
  }

  return (
    <DashboardSidebar>
      <SidebarInset>
        <AppHeader />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-7xl space-y-6"
          >
            {/* Section bienvenue */}
            <WelcomeSection />

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

            {/* Paiements + Réservations */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentReservations />
              </div>
              <div className="lg:col-span-1">
                <PaymentMethodsChart />
              </div>
            </div>
          </motion.div>
        </main>
      </SidebarInset>
    </DashboardSidebar>
  )
}

// ── Section bienvenue ──────────────────────────────────────────────────────────

function WelcomeSection() {
  const activeHotel = useHotelStore((s) => s.activeHotel)
  const { firstName } = useUserProfile()

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Message selon l'heure
  const hour = today.getHours()
  let greeting = 'Bonjour'
  if (hour >= 17) greeting = 'Bonsoir'
  else if (hour < 6) greeting = 'Bonne nuit'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-1"
    >
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {greeting}, {firstName} 👋
      </h1>
      <p className="text-muted-foreground">
        {dateStr}
        {activeHotel && (
          <>
            {' · '}
            <span className="font-medium text-foreground">
              {activeHotel.name}
            </span>{' '}
            — {activeHotel.city}
            {activeHotel.stars ? ` · ${'★'.repeat(activeHotel.stars)}` : ''}
          </>
        )}
      </p>
    </motion.div>
  )
}

// ── Helper pour obtenir le profil utilisateur ──────────────────────────────────

function useUserProfile() {
  // En production, viendrait du store d'auth
  return { firstName: 'Mamadou', lastName: 'Konan' }
}
