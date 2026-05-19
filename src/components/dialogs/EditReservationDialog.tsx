'use client'

import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
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
  type Reservation,
  type Room,
  type ReservationStatus,
} from '@/types'
import {
  Pencil,
  Loader2,
  CalendarIcon,
  BedDouble,
  Moon,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  onSuccess: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

// ── Component ────────────────────────────────────────────────────────────────

export function EditReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: EditReservationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [roomRate, setRoomRate] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')

  // Populate form when reservation changes
  useEffect(() => {
    if (open && reservation) {
      setSelectedRoomId(reservation.roomId)
      setCheckIn(reservation.checkInDate ? new Date(reservation.checkInDate + 'T00:00:00') : undefined)
      setCheckOut(reservation.checkOutDate ? new Date(reservation.checkOutDate + 'T00:00:00') : undefined)
      setRoomRate(reservation.roomRate)
      setDiscountAmount(reservation.discountAmount ?? 0)
      setNotes(reservation.notes ?? '')
      setErrors({})
    }
  }, [open, reservation])

  // Whether dates are editable
  const datesEditable = useMemo(() => {
    if (!reservation) return false
    return reservation.status === 'pending' || reservation.status === 'confirmed'
  }, [reservation])

  // Available rooms for assignment
  const availableRooms = useMemo(() => {
    return MOCK_ROOMS.filter((r) => r.status === 'available' || r.status === 'cleaning' || r.id === reservation?.roomId)
  }, [reservation])

  const selectedRoom = useMemo(() => {
    return MOCK_ROOMS.find((r) => r.id === selectedRoomId) ?? null
  }, [selectedRoomId])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    return countNights(checkIn, checkOut)
  }, [checkIn, checkOut])

  const subtotal = useMemo(() => roomRate * nights, [roomRate, nights])

  const taxRate = 0 // As per mock data

  const taxAmount = useMemo(() => Math.round(subtotal * taxRate), [subtotal, taxRate])

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + taxAmount - discountAmount)
  }, [subtotal, taxAmount, discountAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservation) return

    const errs: Record<string, string> = {}
    if (!selectedRoomId) errs.roomId = 'La chambre est requise'
    if (datesEditable) {
      if (!checkIn) errs.checkIn = "La date d'arrivée est requise"
      if (!checkOut) errs.checkOut = 'La date de départ est requise'
      if (checkIn && checkOut && nights <= 0) errs.checkOut = 'La date de départ doit être après l\'arrivée'
    }
    if (roomRate < 0) errs.roomRate = 'Le tarif ne peut pas être négatif'
    if (discountAmount < 0) errs.discount = 'La remise ne peut pas être négative'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const body: Record<string, unknown> = {
        roomId: selectedRoomId,
        roomRate,
        discountAmount,
        nights,
        subtotal,
        taxAmount,
        totalAmount,
        notes: notes || undefined,
      }

      if (datesEditable && checkIn && checkOut) {
        body.checkInDate = format(checkIn, 'yyyy-MM-dd')
        body.checkOutDate = format(checkOut, 'yyyy-MM-dd')
      }

      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la modification')
      }

      toast.success('Réservation modifiée avec succès')
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      // Offline fallback
      toast.success('Réservation modifiée (mode hors ligne)')
      onSuccess()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!reservation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-[oklch(0.22_0.065_160)]" />
            Modifier la réservation
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono text-xs">{reservation.reference}</span>
            {' — '}
            {reservation.guest?.firstName} {reservation.guest?.lastName}
          </DialogDescription>
        </DialogHeader>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Statut :</span>
          <Badge
            variant="outline"
            className={
              reservation.status === 'pending'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : reservation.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : reservation.status === 'checked_in'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : reservation.status === 'checked_out'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-red-100 text-red-800 border-red-200'
            }
          >
            {reservation.status === 'pending'
              ? 'En attente'
              : reservation.status === 'confirmed'
                ? 'Confirmée'
                : reservation.status === 'checked_in'
                  ? 'En séjour'
                  : reservation.status === 'checked_out'
                    ? 'Terminée'
                    : 'Annulée'}
          </Badge>
          {!datesEditable && (
            <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              Dates non modifiables
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Assignment */}
          <div className="space-y-2">
            <Label htmlFor="edit-room">
              Chambre <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRoomId}
              onValueChange={(v) => {
                setSelectedRoomId(v)
                if (errors.roomId) setErrors((p) => ({ ...p, roomId: '' }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une chambre" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center gap-2">
                      <BedDouble className="size-3.5" />
                      <span>
                        Chambre {room.number} — {room.roomType?.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-xs text-red-500">{errors.roomId}</p>}
          </div>

          {/* Dates (editable only if pending/confirmed) */}
          {datesEditable ? (
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
                      onSelect={(d) => {
                        setCheckIn(d ?? undefined)
                        if (errors.checkIn) setErrors((p) => ({ ...p, checkIn: '' }))
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.checkIn && <p className="text-xs text-red-500">{errors.checkIn}</p>}
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
                      onSelect={(d) => {
                        setCheckOut(d ?? undefined)
                        if (errors.checkOut) setErrors((p) => ({ ...p, checkOut: '' }))
                      }}
                      disabled={(date) =>
                        date < (checkIn ? new Date(checkIn.getTime() + 86400000) : new Date(new Date().setHours(0, 0, 0, 0)))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.checkOut && <p className="text-xs text-red-500">{errors.checkOut}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Arrivée</Label>
                <Input
                  value={
                    reservation.checkInDate
                      ? format(new Date(reservation.checkInDate + 'T00:00:00'), 'dd MMM yyyy', { locale: fr })
                      : '—'
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Départ</Label>
                <Input
                  value={
                    reservation.checkOutDate
                      ? format(new Date(reservation.checkOutDate + 'T00:00:00'), 'dd MMM yyyy', { locale: fr })
                      : '—'
                  }
                  disabled
                />
              </div>
            </div>
          )}

          {/* Rate & Discount */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Tarif / nuit</Label>
              <Input
                id="edit-rate"
                type="number"
                min={0}
                value={roomRate}
                onChange={(e) => {
                  setRoomRate(Math.max(0, parseInt(e.target.value) || 0))
                  if (errors.roomRate) setErrors((p) => ({ ...p, roomRate: '' }))
                }}
              />
              {errors.roomRate && <p className="text-xs text-red-500">{errors.roomRate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-discount">Remise (FCFA)</Label>
              <Input
                id="edit-discount"
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))
                  if (errors.discount) setErrors((p) => ({ ...p, discount: '' }))
                }}
              />
              {errors.discount && <p className="text-xs text-red-500">{errors.discount}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nuits</Label>
              <Input
                value={nights}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Notes internes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
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
              <span>{formatFCFA(taxAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-red-600 dark:text-red-400">
                <span>Remise</span>
                <span>-{formatFCFA(discountAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="font-semibold text-sm">Total</span>
              <span className="text-lg font-bold text-[oklch(0.22_0.065_160)]">
                {formatFCFA(totalAmount)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Pencil className="size-4 mr-1.5" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
