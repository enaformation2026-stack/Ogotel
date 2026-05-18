'use client'

import * as React from 'react'
import {
  Building2,
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  CreditCard,
  BarChart3,
  UserCog,
  Settings,
  Crown,
  Layers,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { useUIStore } from '@/stores/ui.store'
import { useHotelStore } from '@/stores/hotel.store'
import { useAuthStore } from '@/stores/auth.store'
import { SubscriptionBadge } from '@/components/layout/SubscriptionBadge'
import type { ActivePage } from '@/stores/ui.store'
import type { SubscriptionPlan } from '@/types'

// ─── Navigation definitions ─────────────────────────────────────────────────

interface NavItem {
  title: string
  page: ActivePage
  icon: React.ElementType
}

const MAIN_NAV: NavItem[] = [
  { title: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
  { title: 'Mes Hôtels', page: 'hotels', icon: Building2 },
  { title: 'Réservations', page: 'reservations', icon: CalendarDays },
  { title: 'Chambres', page: 'rooms', icon: BedDouble },
  { title: 'Types de Chambres', page: 'room-types', icon: Layers },
  { title: 'Clients', page: 'guests', icon: Users },
  { title: 'Paiements', page: 'payments', icon: CreditCard },
]

const SECONDARY_NAV: NavItem[] = [
  { title: 'Rapports', page: 'reports', icon: BarChart3 },
  { title: 'Personnel', page: 'staff', icon: UserCog },
]

const FOOTER_NAV: NavItem[] = [
  { title: 'Paramètres', page: 'settings', icon: Settings },
  { title: 'Abonnement', page: 'settings-subscription', icon: Crown },
]

// ─── Logo Header ────────────────────────────────────────────────────────────

function SidebarLogo() {
  const { state } = useSidebar()

  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-opacity hover:opacity-80"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
        <Building2 className="size-4 text-sidebar-primary" />
      </div>
      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 ${
          state === 'collapsed'
            ? 'w-0 opacity-0'
            : 'w-auto opacity-100'
        }`}
      >
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          OGOTEL
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/50">
          Cloud
        </span>
      </div>
    </button>
  )
}

// ─── Nav Menu Section ───────────────────────────────────────────────────────

function NavMenu({ items }: { items: NavItem[] }) {
  const activePage = useUIStore((s) => s.activePage)
  const setActivePage = useUIStore((s) => s.setActivePage)

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.page}>
          <SidebarMenuButton
            asChild
            isActive={activePage === item.page}
            tooltip={item.title}
            onClick={() => setActivePage(item.page)}
          >
            <button type="button" className="cursor-pointer">
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

// ─── User Footer ────────────────────────────────────────────────────────────

function SidebarUserFooter() {
  const profile = useAuthStore((s) => s.profile)
  const activeHotel = useHotelStore((s) => s.activeHotel)
  const { state } = useSidebar()

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : '??'

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Utilisateur'

  // Map UserRole to a French label
  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    owner: 'Propriétaire',
    manager: 'Gérant',
    receptionist: 'Réceptionniste',
    accountant: 'Comptable',
  }

  const roleLabel = profile ? roleLabels[profile.role] ?? profile.role : ''

  // For now use a mock plan — later this can come from an org/subscription store
  const currentPlan: SubscriptionPlan = 'pro'

  return (
    <SidebarFooter className="mt-auto">
      {/* Plan badge — hidden when collapsed */}
      <div
        className={`transition-all duration-200 ${
          state === 'collapsed'
            ? 'mx-auto flex w-0 justify-center overflow-hidden opacity-0'
            : 'flex opacity-100'
        }`}
      >
        <SubscriptionBadge plan={currentPlan} />
      </div>

      {/* Separator */}
      <SidebarSeparator />

      {/* User info */}
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        {/* Avatar initials */}
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-sidebar-foreground"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.40 0.10 160), oklch(0.30 0.07 160))',
          }}
        >
          {initials}
        </div>

        {/* Name & role — hidden when collapsed */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden transition-all duration-200 ${
            state === 'collapsed'
              ? 'w-0 opacity-0'
              : 'w-auto opacity-100'
          }`}
        >
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {displayName}
          </span>
          <span className="truncate text-[11px] text-sidebar-foreground/50">
            {roleLabel}
          </span>
        </div>
      </div>
    </SidebarFooter>
  )
}

// ─── Inner sidebar (consumes SidebarContext from parent) ─────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with logo */}
      <SidebarHeader className="pt-4 pb-2">
        <SidebarLogo />
      </SidebarHeader>

      {/* Main navigation */}
      <SidebarContent>
        {/* Primary nav group */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMenu items={MAIN_NAV} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary nav group */}
        <SidebarGroup>
          <SidebarGroupLabel>Analytics & Équipe</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMenu items={SECONDARY_NAV} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer nav (settings & subscription) pinned to bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <NavMenu items={FOOTER_NAV} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with plan badge & user info */}
      <SidebarUserFooter />

      {/* Rail for collapsing */}
      <SidebarRail />
    </Sidebar>
  )
}

// ─── Provider wrapper for composing in layout ───────────────────────────────

export function DashboardSidebar({
  children,
  ...props
}: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider {...props}>
      <AppSidebar />
      {children}
    </SidebarProvider>
  )
}
