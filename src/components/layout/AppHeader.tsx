'use client'

import * as React from 'react'
import {
  Building2,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { useHotelStore } from '@/stores/hotel.store'
import { useAuthStore } from '@/stores/auth.store'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ── Page name mapping ────────────────────────────────────────────────────────
const PAGE_NAMES: Record<string, string> = {
  dashboard: 'Tableau de bord',
  reservations: 'Réservations',
  rooms: 'Chambres',
  'room-types': 'Types de chambres',
  guests: 'Clients',
  payments: 'Paiements',
  reports: 'Rapports',
  staff: 'Personnel',
  settings: 'Paramètres',
  'settings-hotel': 'Paramètres - Hôtel',
  'settings-subscription': 'Abonnement',
  'settings-account': 'Mon compte',
}

// ── Helper: get user initials ────────────────────────────────────────────────
function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? ''
  const last = lastName?.charAt(0)?.toUpperCase() ?? ''
  return first + last
}

// ── Helper: role label ───────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner: 'Propriétaire',
  manager: 'Gérant',
  receptionist: 'Réceptionniste',
  accountant: 'Comptable',
}

// ── Component ────────────────────────────────────────────────────────────────
export function AppHeader({ className }: { className?: string }) {
  const activePage = useUIStore((s) => s.activePage)
  const activeHotel = useHotelStore((s) => s.activeHotel)
  const hotels = useHotelStore((s) => s.hotels)
  const setActiveHotel = useHotelStore((s) => s.setActiveHotel)
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)

  const [hotelSwitcherOpen, setHotelSwitcherOpen] = React.useState(false)

  const pageTitle = PAGE_NAMES[activePage] ?? activePage
  const initials = getInitials(profile?.firstName, profile?.lastName)
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Utilisateur'
  const roleLabel = ROLE_LABELS[profile?.role ?? ''] ?? profile?.role

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md',
        className,
      )}
    >
      {/* ── Left: sidebar toggle + breadcrumb ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">OGOTEL</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Spacer ─────────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right: actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Hotel Switcher */}
        <Popover
          open={hotelSwitcherOpen}
          onOpenChange={setHotelSwitcherOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 sm:flex"
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[140px] truncate">
                {activeHotel?.name ?? 'Sélectionner un hôtel'}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Rechercher un hôtel..." />
              <CommandList>
                <CommandEmpty>Aucun hôtel trouvé.</CommandEmpty>
                <CommandGroup>
                  {hotels.map((hotel) => {
                    const isActive = hotel.id === activeHotel?.id
                    return (
                      <CommandItem
                        key={hotel.id}
                        value={hotel.name}
                        onSelect={() => {
                          setActiveHotel(hotel)
                          setHotelSwitcherOpen(false)
                        }}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {hotel.name}
                          </span>
                          {hotel.city && (
                            <span className="truncate text-xs text-muted-foreground">
                              {hotel.city}
                              {hotel.stars ? ` · ${'★'.repeat(hotel.stars)}` : ''}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default AppHeader
