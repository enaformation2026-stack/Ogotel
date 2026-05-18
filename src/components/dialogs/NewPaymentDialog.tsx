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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import {
  formatFCFA,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type Reservation,
} from '@/types'
import {
  Search,
  CreditCard,
  Loader2,
  Phone,
  Wallet,
  Banknote,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface NewPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  prefillReservationId?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return `${f}${l}`
}

const METHOD_ICONS: Partial<Record<PaymentMethod, React.ElementType>> = {
  cash: Banknote,
  orange_money: CreditCard,
  mtn_money: CreditCard,
  wave: CreditCard,
  moov_money: CreditCard,
  card: CreditCard,
  bank_transfer: Wallet,
}

const MOBILE_MONEY_METHODS: PaymentMethod[] = [
  'orange_money',
  'mtn_money',
  'wave',
  'moov_money',
]

// ── Component ───────────────────────────────────────────────────────────────

export function NewPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  prefillReservationId,
}: NewPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod | ''>('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Active reservations with balance due
  const payableReservations = useMemo(() => {
    return MOCK_RESERVATIONS.filter(
      (r) =>
        (r.status === 'pending' || r.status === 'confirmed' || r.status === 'checked_in') &&
        r.balanceDue > 0
    )
  }, [])

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) return payableReservations
    const q = searchQuery.toLowerCase()
    return payableReservations.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        `${r.guest?.firstName ?? ''} ${r.guest?.lastName ?? ''}`
          .toLowerCase()
          .includes(q)
    )
  }, [searchQuery, payableReservations])

  // Auto-fill amount with remaining balance
  useEffect(() => {
    if (selectedReservation && !amount) {
      setAmount(String(selectedReservation.balanceDue))
    }
  }, [selectedReservation, amount])

  // Auto-set from prefill
  useEffect(() => {
    if (open) {
      if (prefillReservationId) {
        const res = MOCK_RESERVATIONS.find((r) => r.id === prefillReservationId)
        if (res) setSelectedReservation(res)
      }
    }
  }, [open, prefillReservationId])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setSelectedReservation(prefillReservationId ? MOCK_RESERVATIONS.find((r) => r.id === prefillReservationId) ?? null : null)
      setAmount('')
      setMethod('')
      setMobileNumber('')
      setNotes('')
    }
  }, [open, prefillReservationId])

  const isMobileMoney = method && MOBILE_MONEY_METHODS.includes(method as PaymentMethod)

  const parsedAmount = parseFloat(amount) || 0

  const handleSubmit = async () => {
    if (!selectedReservation || !method || parsedAmount <= 0) return

    setIsSubmitting(true)
    try {
      const body: Record<string, any> = {
        reservationId: selectedReservation.id,
        amount: parsedAmount,
        method,
        notes: notes || undefined,
      }

      if (isMobileMoney && mobileNumber) {
        body.mobileNumber = mobileNumber
      }

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de l\'enregistrement du paiement')
      }

      toast.success('Paiement enregistré avec succès')
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-[oklch(0.22_0.065_160)]" />
            Nouveau paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrez un paiement pour une réservation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reservation Search / Selection */}
          {!selectedReservation ? (
            <div className="space-y-2">
              <Label>Réservation</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Référence ou nom du client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-md border p-2">
                {filteredReservations.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucune réservation avec solde dû
                  </p>
                ) : (
                  filteredReservations.map((res) => (
                    <button
                      key={res.id}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                      onClick={() => setSelectedReservation(res)}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                        {getInitials(res.guest?.firstName, res.guest?.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {res.guest?.firstName} {res.guest?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {res.reference} · Ch. {res.room?.number}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                          {formatFCFA(res.balanceDue)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">solde dû</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Réservation
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSelectedReservation(null)
                    setAmount('')
                  }}
                >
                  Changer
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.22_0.065_160)] text-white text-xs font-semibold">
                  {getInitials(selectedReservation.guest?.firstName, selectedReservation.guest?.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {selectedReservation.guest?.firstName} {selectedReservation.guest?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReservation.reference} · Ch. {selectedReservation.room?.number}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="text-center rounded-md bg-background p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                  <p className="text-xs font-semibold">{formatFCFA(selectedReservation.totalAmount)}</p>
                </div>
                <div className="text-center rounded-md bg-background p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Payé</p>
                  <p className="text-xs font-semibold text-emerald-600">
                    {formatFCFA(selectedReservation.paidAmount)}
                  </p>
                </div>
                <div className="text-center rounded-md bg-background p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Solde dû</p>
                  <p className="text-xs font-bold text-red-600">
                    {formatFCFA(selectedReservation.balanceDue)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une méthode" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
                  ([value, label]) => {
                    const Icon = METHOD_ICONS[value]
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="size-3.5" />}
                          {label}
                        </span>
                      </SelectItem>
                    )
                  }
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Number (for mobile money) */}
          {isMobileMoney && (
            <div className="space-y-2">
              <Label htmlFor="payment-mobile" className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                Numéro mobile
              </Label>
              <Input
                id="payment-mobile"
                type="tel"
                placeholder="+225 05 01 02 03"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Montant</Label>
            <div className="relative">
              <Input
                id="payment-amount"
                type="number"
                min={0}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16 text-lg font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                FCFA
              </span>
            </div>
            {selectedReservation && parsedAmount > selectedReservation.balanceDue && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Attention : le montant dépasse le solde dû ({formatFCFA(selectedReservation.balanceDue)})
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              placeholder="Référence, observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReservation || !method || parsedAmount <= 0}
            className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CreditCard className="size-4 mr-1.5" />
                Enregistrer le paiement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
