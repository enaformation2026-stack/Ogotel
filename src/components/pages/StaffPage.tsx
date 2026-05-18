'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRelativeDate } from '@/types'
import { UserPlus, MoreVertical, Pencil, ShieldOff, Users } from 'lucide-react'

// ==========================================
// CONSTANTS
// ==========================================

const STAFF_MEMBERS = [
  { id: '1', firstName: 'Mamadou', lastName: 'Konan', email: 'mamadou@hotel-cocody.ci', role: 'owner' as const, isActive: true, lastLogin: '2024-10-15T10:30:00' },
  { id: '2', firstName: 'Fatou', lastName: 'Diallo', email: 'fatou@hotel-cocody.ci', role: 'manager' as const, isActive: true, lastLogin: '2024-10-15T09:15:00' },
  { id: '3', firstName: 'Aminata', lastName: 'Coulibaly', email: 'aminata@hotel-cocody.ci', role: 'receptionist' as const, isActive: true, lastLogin: '2024-10-15T08:00:00' },
  { id: '4', firstName: 'Ibrahim', lastName: 'Traoré', email: 'ibrahim@hotel-cocody.ci', role: 'receptionist' as const, isActive: true, lastLogin: '2024-10-14T14:00:00' },
  { id: '5', firstName: 'Mariam', lastName: 'Bamba', email: 'mariam@hotel-cocody.ci', role: 'accountant' as const, isActive: true, lastLogin: '2024-10-15T11:00:00' },
  { id: '6', firstName: 'Olivier', lastName: "N'Guessan", email: 'olivier@hotel-cocody.ci', role: 'receptionist' as const, isActive: false, lastLogin: '2024-10-10T16:00:00' },
]

const ROLE_STYLES: Record<string, string> = {
  owner: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300',
  manager: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
  receptionist: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300',
  accountant: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300',
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  manager: 'Gérant',
  receptionist: 'Réceptionniste',
  accountant: 'Comptable',
  super_admin: 'Super Admin',
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

// ==========================================
// COMPONENT
// ==========================================

export function StaffPage() {
  const activeCount = STAFF_MEMBERS.filter((m) => m.isActive).length
  const uniqueRoles = new Set(STAFF_MEMBERS.map((m) => m.role)).size
  const maxSeats = 10
  const remainingSeats = maxSeats - STAFF_MEMBERS.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Personnel</h1>
          <Badge variant="secondary" className="text-sm">
            {STAFF_MEMBERS.length}
          </Badge>
        </div>
        <Button variant="outline" disabled>
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Membres actifs</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Rôles</p>
              <p className="text-2xl font-bold">{uniqueRoles} différents</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="M3 9h18" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Places restantes</p>
              <p className="text-2xl font-bold">
                {remainingSeats}/{maxSeats}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[240px]">Membre</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {STAFF_MEMBERS.map((member) => (
              <TableRow key={member.id}>
                {/* Membre */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className={`${getAvatarColor(member.firstName + member.lastName)} text-white text-xs font-semibold`}
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Rôle */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${ROLE_STYLES[member.role] ?? ''}`}
                  >
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        member.isActive
                          ? 'bg-emerald-500'
                          : 'bg-gray-400 dark:bg-gray-500'
                      }`}
                    />
                    {member.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>

                {/* Dernière connexion */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeDate(member.lastLogin)}
                  </span>
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
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Désactiver
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
        {STAFF_MEMBERS.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      className={`${getAvatarColor(member.firstName + member.lastName)} text-white text-sm font-semibold`}
                    >
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {member.email}
                    </p>
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
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Désactiver
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${ROLE_STYLES[member.role] ?? ''}`}
                >
                  {ROLE_LABELS[member.role] ?? member.role}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      member.isActive
                        ? 'bg-emerald-500'
                        : 'bg-gray-400 dark:bg-gray-500'
                    }`}
                  />
                  {member.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Dernière connexion : {formatRelativeDate(member.lastLogin)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
