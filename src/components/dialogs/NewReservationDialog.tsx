'use client'

import * as React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_ROOMS, MOCK_GUESTS } from '@/lib/mock-data'
import {
  formatFCFA,
  type Room,
  type Guest,
  type Reservation,
} from '@/types'
import {
  Search,
  CalendarIcon,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  BedDouble,
  Building2,
  Users,
  Moon,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface NewReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Step = 1 | 2 | 3

// ── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return `${f}${l}`
}

function countNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

// ── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }: { currentStep: Step; totalSteps: number }) {
  const steps = [
    { num: 1, label: 'Client' },
    { num: 2, label: 'Chambre & Dates' },
    { num: 3, label: 'Confirmation' },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, idx) => {
        const isActive = step.num === currentStep
        const isCompleted = step.num < currentStep
        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-1.5">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[oklch(0.22_0.065_160)] text-white'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="size-3.5" /> : step.num}
              </div>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${
                  step.num < currentStep ? 'bg-emerald-300' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

export function NewReservationDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewReservationDialogProps) {
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestSearch, setGuestSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setGuestSearch('')
      setSelectedGuest(null)
      setSelectedRoom(null)
      setCheckIn(undefined)
      setCheckOut(undefined)
      setAdults(1)
      setChildren(0)
      setSpecialRequests('')
    }
  }, [open])

  // Filter guests
  const filteredGuests = useMemo(() => {
    if (!guestSearch.trim()) return MOCK_GUESTS
    const q = guestSearch.toLowerCase()
    return MOCK_GUESTS.filter(
      (g) =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
        (g.phone ?? '').toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q)
    )
  }, [guestSearch])

  // Available rooms (only available/cleaning for demo)
  const availableRooms = useMemo(() => {
    return MOCK_ROOMS.filter((r) => r.status === 'available' || r.status === 'cleaning')
  }, [])

  // Computed values
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    return countNights(checkIn, checkOut)
  }, [checkIn, checkOut])

  const roomRate = useMemo(() => {
    if (!selectedRoom) return 0
    return selectedRoom.priceOverride ?? selectedRoom.roomType?.basePrice ?? 0
  }, [selectedRoom])

  const subtotal = useMemo(() => roomRate * nights, [roomRate, nights])

  const totalAmount = useMemo(() => {
    // Assume 0% tax as per mock hotel data
    return subtotal
  }, [subtotal])

  // ── Step handlers ────────────────────────────────────────────────────────

  const canGoNext = useCallback((): boolean => {
    if (step === 1) return selectedGuest !== null
    if (step === 2) return selectedRoom !== null && checkIn !== undefined && checkOut !== undefined && nights > 0
    return true
  }, [step, selectedGuest, selectedRoom, checkIn, checkOut, nights])

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }

  const handleSubmit = async () => {
    if (!selectedGuest || !selectedRoom || !checkIn || !checkOut) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedGuest.id,
          roomId: selectedRoom.id,
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
          adults,
          children,
          roomRate,
          nights,
          totalAmount,
          specialRequests: specialRequests || undefined,
          source: 'direct',
          isWalkIn: false,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la création de la réservation')
      }

      toast.success('Réservation créée avec succès')
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="size-5 text-[oklch(0.22_0.065_160)]" />
            Nouvelle réservation
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Sélectionnez ou créez un client'}
            {step === 2 && 'Choisissez une chambre et les dates'}
            {step === 3 && 'Vérifiez et confirmez les informations'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="pt-1">
          <StepIndicator currentStep={step} totalSteps={3} />
        </div>

        {/* Step 1: Guest Selection */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Show inline NewGuestDialog stub */}
            {selectedGuest ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.22_0.065_160)] text-white text-xs font-semibold">
                      {getInitials(selectedGuest.firstName, selectedGuest.lastName)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedGuest.firstName} {selectedGuest.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedGuest.phone ?? selectedGuest.email ?? '—'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGuest(null)}
                  >
                    Changer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, téléphone, email..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-md border p-2">
                  {filteredGuests.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Aucun client trouvé
                    </p>
                  ) : (
                    filteredGuests.map((guest) => (
                      <button
                        key={guest.id}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                        onClick={() => setSelectedGuest(guest)}
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(guest.firstName, guest.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {guest.firstName} {guest.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {guest.phone ?? guest.email ?? '—'}
                          </p>
                        </div>
                        {guest.tags.includes('VIP') && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
                            VIP
                          </Badge>
                        )}
                      </button>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <UserPlus className="inline size-3 mr-1" />
                  Utilisez la page Clients pour ajouter un nouveau client
                </p>
              </>
            )}
          </div>
        )}

        {/* Step 2: Room & Dates */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Room Selection */}
            <div className="space-y-2">
              <Label>Chambre</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id
                  const price = room.priceOverride ?? room.roomType?.basePrice ?? 0
                  return (
                    <button
                      key={room.id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-[oklch(0.22_0.065_160)] bg-[oklch(0.22_0.065_160)]/5 ring-1 ring-[oklch(0.22_0.065_160)]'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold">
                        {room.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {room.roomType?.name ?? 'Non défini'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3" />
                            {room.floor ?? '—'}
                          </span>
                          <span>{formatFCFA(price)}/nuit</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="size-4 text-[oklch(0.22_0.065_160)]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date d&apos;arrivée</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-left font-normal"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {checkIn ? (
                        format(checkIn, 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">Sélectionner</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Date de départ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-left font-normal"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {checkOut ? (
                        format(checkOut, 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">Sélectionner</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) =>
                        date < (checkIn ? new Date(checkIn.getTime() + 86400000) : new Date(new Date().setHours(0, 0, 0, 0)))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Nights count & Price */}
            {nights > 0 && selectedRoom && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Moon className="size-3.5" />
                    Durée
                  </span>
                  <span className="font-medium">
                    {nights} nuit{nights > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tarif / nuit</span>
                  <span className="font-medium">{formatFCFA(roomRate)}</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Sous-total</span>
                  <span className="font-bold text-[oklch(0.22_0.065_160)]">
                    {formatFCFA(subtotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Guests count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adultes</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label>Enfants</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
            </div>

            {/* Special requests */}
            <div className="space-y-2">
              <Label>Demandes spéciales</Label>
              <Textarea
                placeholder="Ex: lit bébé, allergies..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && selectedGuest && selectedRoom && checkIn && checkOut && (
          <div className="space-y-4">
            {/* Guest Summary */}
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Client
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.22_0.065_160)] text-white text-xs font-semibold">
                  {getInitials(selectedGuest.firstName, selectedGuest.lastName)}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedGuest.phone ?? selectedGuest.email ?? '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Room & Dates Summary */}
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chambre & Dates
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BedDouble className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Chambre {selectedRoom.number}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedRoom.roomType?.name}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span>
                  {format(checkIn, 'dd MMM yyyy', { locale: fr })} &rarr;{' '}
                  {format(checkOut, 'dd MMM yyyy', { locale: fr })}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {nights} nuit{nights > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>
                  {adults} adulte{adults > 1 ? 's' : ''}
                  {children > 0 && `, ${children} enfant${children > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tarification
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatFCFA(roomRate)} × {nights} nuit{nights > 1 ? 's' : ''}
                </span>
                <span>{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxe</span>
                <span>0 FCFA</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-semibold text-sm">Total</span>
                <span className="text-lg font-bold text-[oklch(0.22_0.065_160)]">
                  {formatFCFA(totalAmount)}
                </span>
              </div>
            </div>

            {specialRequests && (
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Demandes spéciales
                </p>
                <p className="text-sm">{specialRequests}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="size-4 mr-1.5" />
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            >
              Suivant
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="size-4 mr-1.5" />
                  Confirmer la réservation
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
