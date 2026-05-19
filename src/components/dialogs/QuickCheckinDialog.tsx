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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_ROOMS } from '@/lib/mock-data'
import {
  formatFCFA,
  type Room,
  type PaymentMethod,
  type Guest,
  type Reservation,
} from '@/types'
import {
  LogIn,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  BedDouble,
  CalendarIcon,
  Moon,
  Wallet,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuickCheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Step = 1 | 2

interface GuestData {
  firstName: string
  lastName: string
  phone: string
  nationality: string
}

interface StayData {
  roomId: string
  checkIn: Date | undefined
  checkOut: Date | undefined
  adults: number
  paymentMethod: PaymentMethod
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

const NATIONALITY_OPTIONS = [
  { value: 'Ivoirienne', label: 'Ivoirienne' },
  { value: 'Sénégalaise', label: 'Sénégalaise' },
  { value: 'Malian', label: 'Malian' },
  { value: 'Burkinabè', label: 'Burkinabè' },
  { value: 'Camerounaise', label: 'Camerounaise' },
  { value: 'Guinéenne', label: 'Guinéenne' },
  { value: 'Nigériane', label: 'Nigériane' },
  { value: 'Ghanéenne', label: 'Ghanéenne' },
  { value: 'Autre', label: 'Autre' },
]

const PAYMENT_METHODS = [
  { value: 'cash' as PaymentMethod, label: 'Cash' },
  { value: 'orange_money' as PaymentMethod, label: 'Orange Money' },
  { value: 'mtn_money' as PaymentMethod, label: 'MTN Money' },
  { value: 'wave' as PaymentMethod, label: 'Wave' },
  { value: 'moov_money' as PaymentMethod, label: 'Moov Money' },
  { value: 'card' as PaymentMethod, label: 'Carte bancaire' },
]

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 1, label: 'Client' },
    { num: 2, label: 'Chambre & Séjour' },
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

// ── Component ────────────────────────────────────────────────────────────────

export function QuickCheckinDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickCheckinDialogProps) {
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1: Guest data
  const [guestData, setGuestData] = useState<GuestData>({
    firstName: '',
    lastName: '',
    phone: '',
    nationality: 'Ivoirienne',
  })

  // Step 2: Stay data
  const [stayData, setStayData] = useState<StayData>({
    roomId: '',
    checkIn: undefined,
    checkOut: undefined,
    adults: 1,
    paymentMethod: 'cash',
  })

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1)
      setGuestData({ firstName: '', lastName: '', phone: '', nationality: 'Ivoirienne' })
      setStayData({ roomId: '', checkIn: undefined, checkOut: undefined, adults: 1, paymentMethod: 'cash' })
      setErrors({})
    }
  }, [open])

  // Available rooms
  const availableRooms = useMemo(() => {
    return MOCK_ROOMS.filter((r) => r.status === 'available' || r.status === 'cleaning')
  }, [])

  const selectedRoom = useMemo(() => {
    return MOCK_ROOMS.find((r) => r.id === stayData.roomId) ?? null
  }, [stayData.roomId])

  const roomRate = useMemo(() => {
    if (!selectedRoom) return 0
    return selectedRoom.priceOverride ?? selectedRoom.roomType?.basePrice ?? 0
  }, [selectedRoom])

  const nights = useMemo(() => {
    if (!stayData.checkIn || !stayData.checkOut) return 0
    return countNights(stayData.checkIn, stayData.checkOut)
  }, [stayData.checkIn, stayData.checkOut])

  const totalAmount = useMemo(() => roomRate * nights, [roomRate, nights])

  // Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!guestData.firstName.trim()) errs.firstName = 'Le prénom est requis'
    if (!guestData.lastName.trim()) errs.lastName = 'Le nom est requis'
    if (!guestData.phone.trim()) errs.phone = 'Le téléphone est requis'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!stayData.roomId) errs.roomId = 'Veuillez sélectionner une chambre'
    if (!stayData.checkIn) errs.checkIn = 'La date d\'arrivée est requise'
    if (!stayData.checkOut) errs.checkOut = 'La date de départ est requise'
    if (stayData.checkIn && stayData.checkOut && nights <= 0) errs.checkOut = 'La date de départ doit être après l\'arrivée'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    if (!selectedRoom || !stayData.checkIn || !stayData.checkOut) return

    setIsSubmitting(true)
    try {
      // Step 1: Create guest
      const guestRes = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          phone: guestData.phone,
          nationality: guestData.nationality,
        }),
      })

      if (!guestRes.ok) {
        const data = await guestRes.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la création du client')
      }

      const guest: Guest = await guestRes.json()

      // Step 2: Create reservation
      const resRes = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guest.id,
          roomId: selectedRoom.id,
          checkInDate: format(stayData.checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(stayData.checkOut, 'yyyy-MM-dd'),
          adults: stayData.adults,
          roomRate,
          nights,
          totalAmount,
          source: 'walk-in',
          isWalkIn: true,
        }),
      })

      if (!resRes.ok) {
        const data = await resRes.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la réservation')
      }

      const reservation: Reservation = await resRes.json()

      // Step 3: Check-in (PATCH reservation)
      await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_in' }),
      }).catch(() => {})

      // Step 4: Create payment
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: totalAmount,
          method: stayData.paymentMethod,
          status: 'completed',
        }),
      }).catch(() => {})

      toast.success(
        `Check-in effectué — Chambre ${selectedRoom.number}, ${guest.firstName} ${guest.lastName}`
      )
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="size-5 text-[oklch(0.22_0.065_160)]" />
            Check-in rapide (Walk-in)
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Informations du client'}
            {step === 2 && 'Sélection de la chambre et du séjour'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="pt-1">
          <StepIndicator currentStep={step} />
        </div>

        {/* Step 1: Guest Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qc-firstName">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qc-firstName"
                  placeholder="Aminata"
                  value={guestData.firstName}
                  onChange={(e) => {
                    setGuestData((d) => ({ ...d, firstName: e.target.value }))
                    if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' }))
                  }}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-lastName">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qc-lastName"
                  placeholder="Koné"
                  value={guestData.lastName}
                  onChange={(e) => {
                    setGuestData((d) => ({ ...d, lastName: e.target.value }))
                    if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' }))
                  }}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qc-phone">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="qc-phone"
                type="tel"
                placeholder="+225 05 01 02 03"
                value={guestData.phone}
                onChange={(e) => {
                  setGuestData((d) => ({ ...d, phone: e.target.value }))
                  if (errors.phone) setErrors((p) => ({ ...p, phone: '' }))
                }}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label>Nationalité</Label>
              <Select
                value={guestData.nationality}
                onValueChange={(v) => setGuestData((d) => ({ ...d, nationality: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nationalité" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Room & Stay */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Room Selection */}
            <div className="space-y-2">
              <Label>
                Chambre <span className="text-red-500">*</span>
              </Label>
              <Select
                value={stayData.roomId}
                onValueChange={(v) => {
                  setStayData((d) => ({ ...d, roomId: v }))
                  if (errors.roomId) setErrors((p) => ({ ...p, roomId: '' }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une chambre disponible" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <BedDouble className="size-3.5" />
                        <span>
                          Chambre {room.number} — {room.roomType?.name} —{' '}
                          {formatFCFA(room.priceOverride ?? room.roomType?.basePrice ?? 0)}/nuit
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && <p className="text-xs text-red-500">{errors.roomId}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Arrivée <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-left font-normal"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {stayData.checkIn ? (
                        format(stayData.checkIn, 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">Aujourd&apos;hui</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={stayData.checkIn}
                      onSelect={(d) => {
                        setStayData((s) => ({ ...s, checkIn: d ?? undefined }))
                        if (errors.checkIn) setErrors((p) => ({ ...p, checkIn: '' }))
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>
                  Départ <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-left font-normal"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {stayData.checkOut ? (
                        format(stayData.checkOut, 'dd MMM yyyy', { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">Sélectionner</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={stayData.checkOut}
                      onSelect={(d) => {
                        setStayData((s) => ({ ...s, checkOut: d ?? undefined }))
                        if (errors.checkOut) setErrors((p) => ({ ...p, checkOut: '' }))
                      }}
                      disabled={(date) =>
                        date < (stayData.checkIn ? new Date(stayData.checkIn.getTime() + 86400000) : new Date(new Date().setHours(0, 0, 0, 0)))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Adults & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adultes</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={stayData.adults}
                  onChange={(e) =>
                    setStayData((d) => ({
                      ...d,
                      adults: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <Select
                  value={stayData.paymentMethod}
                  onValueChange={(v) =>
                    setStayData((d) => ({ ...d, paymentMethod: v as PaymentMethod }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        <span className="flex items-center gap-1.5">
                          <Wallet className="size-3.5" />
                          {pm.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
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
                  <span className="font-medium">Total à payer</span>
                  <span className="font-bold text-[oklch(0.22_0.065_160)]">
                    {formatFCFA(totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="size-4 mr-1.5" />
              Retour
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={handleNext}
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
                  Check-in en cours...
                </>
              ) : (
                <>
                  <LogIn className="size-4 mr-1.5" />
                  Effectuer le check-in
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
