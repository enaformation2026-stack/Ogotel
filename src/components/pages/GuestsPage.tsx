'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MOCK_GUESTS } from '@/lib/mock-data'
import { formatFCFA, formatRelativeDate, type Guest } from '@/types'
import { Plus, Search, MoreVertical, Eye, Pencil, Users } from 'lucide-react'
import { NewGuestDialog } from '@/components/dialogs/NewGuestDialog'
import { toast } from 'sonner'

// ==========================================
// CONSTANTS
// ==========================================

const COUNTRY_FLAGS: Record<string, string> = {
  "Côte d'Ivoire": '🇨🇮',
  'Mali': '🇲🇱',
  'Sénégal': '🇸🇳',
  'Cameroun': '🇨🇲',
  'Bénin': '🇧🇯',
  'Togo': '🇹🇬',
  'Guinée': '🇬🇳',
  'Burkina Faso': '🇧🇫',
  'Niger': '🇳🇪',
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getTagStyle(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'vip':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
    case 'corporate':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
}

// ==========================================
// COMPONENT
// ==========================================

export function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)

  const handleRefresh = () => {
    setShowNewDialog(false)
  }

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_GUESTS
    const q = searchQuery.toLowerCase()
    return MOCK_GUESTS.filter((guest) => {
      const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
      const phone = (guest.phone ?? '').toLowerCase()
      const email = (guest.email ?? '').toLowerCase()
      return fullName.includes(q) || phone.includes(q) || email.includes(q)
    })
  }, [searchQuery])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <Badge variant="secondary" className="text-sm">
            {MOCK_GUESTS.length}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nom, téléphone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-72"
            />
          </div>
          <Button variant="outline" onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredGuests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">
            Aucun client trouvé
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez d&apos;ajuster votre recherche
          </p>
        </div>
      )}

      {/* Desktop Table */}
      {filteredGuests.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Nationalité</TableHead>
                  <TableHead>Séjours</TableHead>
                  <TableHead>Total dépensé</TableHead>
                  <TableHead>Dernier séjour</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    {/* Client */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback
                            className={`${getAvatarColor(guest.firstName + guest.lastName)} text-white text-xs font-semibold`}
                          >
                            {getInitials(guest.firstName, guest.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight truncate">
                            {guest.firstName} {guest.lastName}
                          </p>
                          {guest.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {guest.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Téléphone */}
                    <TableCell>
                      {guest.phone ? (
                        <a
                          href={`tel:${guest.phone}`}
                          className="text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 transition-colors"
                        >
                          {guest.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Nationalité */}
                    <TableCell>
                      {guest.country ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span>{COUNTRY_FLAGS[guest.country] ?? '🌍'}</span>
                          <span>{guest.nationality}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Séjours */}
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {guest.totalStays} séjour{guest.totalStays !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>

                    {/* Total dépensé */}
                    <TableCell>
                      <span className="font-semibold">
                        {formatFCFA(guest.totalSpent)}
                      </span>
                    </TableCell>

                    {/* Dernier séjour */}
                    <TableCell>
                      <span className="text-muted-foreground">
                        {guest.lastStayAt
                          ? formatRelativeDate(guest.lastStayAt)
                          : '—'}
                      </span>
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guest.tags.length > 0
                          ? guest.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`text-xs font-medium ${getTagStyle(tag)}`}
                              >
                                {tag}
                              </Badge>
                            ))
                          : <span className="text-muted-foreground text-sm">—</span>}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir fiche
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={`${getAvatarColor(guest.firstName + guest.lastName)} text-white text-sm font-semibold`}
                      >
                        {getInitials(guest.firstName, guest.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate">
                        {guest.firstName} {guest.lastName}
                      </p>
                      {guest.email && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {guest.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir fiche
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {guest.phone && (
                  <a
                    href={`tel:${guest.phone}`}
                    className="mt-2 block text-sm text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 transition-colors"
                  >
                    {guest.phone}
                  </a>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {guest.country && (
                    <span className="inline-flex items-center gap-1">
                      {COUNTRY_FLAGS[guest.country] ?? '🌍'} {guest.nationality}
                    </span>
                  )}
                  <span className="inline-flex items-center">
                    {guest.totalStays} séjour{guest.totalStays !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-semibold">
                    {formatFCFA(guest.totalSpent)}
                  </span>
                  {guest.lastStayAt && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {formatRelativeDate(guest.lastStayAt)}
                      </span>
                    </>
                  )}
                </div>

                {guest.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {guest.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`text-xs font-medium ${getTagStyle(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Guest Dialog */}
      <NewGuestDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={(guest) => {
          setShowNewDialog(false)
          toast.success(`Client ${guest.firstName} ${guest.lastName} créé avec succès`)
        }}
      />
    </div>
  )
}
