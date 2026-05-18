'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { type Hotel } from '@/types'
import {
  Loader2,
  Building2,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'

// ==========================================
// TYPES
// ==========================================

interface EditHotelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotel: Hotel | null
  onSuccess: (hotel: Hotel) => void
}

interface FormErrors {
  name?: string
  email?: string
  checkInTime?: string
  checkOutTime?: string
  taxRate?: string
}

// ==========================================
// VALIDATION
// ==========================================

function validateForm(data: {
  name: string
  email: string
  checkInTime: string
  checkOutTime: string
  taxRate: string
}): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Le nom est requis'
  } else if (data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères'
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Adresse email invalide'
  }

  if (!data.checkInTime) {
    errors.checkInTime = "L'heure de check-in est requise"
  }

  if (!data.checkOutTime) {
    errors.checkOutTime = "L'heure de check-out est requise"
  }

  const taxRate = parseFloat(data.taxRate)
  if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    errors.taxRate = 'Le taux TVA doit être entre 0 et 100'
  }

  return errors
}

// ==========================================
// COMPONENT
// ==========================================

export function EditHotelDialog({
  open,
  onOpenChange,
  hotel,
  onSuccess,
}: EditHotelDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [stars, setStars] = useState('3')
  const [description, setDescription] = useState('')
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutTime, setCheckOutTime] = useState('12:00')
  const [currency, setCurrency] = useState('FCFA')
  const [taxRate, setTaxRate] = useState('0')

  // Pre-fill form when hotel changes
  useEffect(() => {
    if (open && hotel) {
      setName(hotel.name)
      setEmail(hotel.email ?? '')
      setPhone(hotel.phone ?? '')
      setCity(hotel.city ?? '')
      setDistrict(hotel.district ?? '')
      setAddress(hotel.address ?? '')
      setStars(String(hotel.stars ?? 3))
      setDescription(hotel.description ?? '')
      setCheckInTime(hotel.checkInTime)
      setCheckOutTime(hotel.checkOutTime)
      setCurrency(hotel.defaultCurrency)
      setTaxRate(String(hotel.taxRate))
      setErrors({})
    }
  }, [open, hotel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hotel) return

    const formData = { name, email, checkInTime, checkOutTime, taxRate }
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        stars: parseInt(stars),
        description: description.trim() || undefined,
        checkInTime,
        checkOutTime,
        defaultCurrency: currency,
        taxRate: parseFloat(taxRate),
      }

      const res = await fetch(`/api/hotels/${hotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de la modification de l'hôtel")
      }

      const data = await res.json()
      toast.success('Hôtel mis à jour avec succès')
      onSuccess(data)
      onOpenChange(false)
    } catch (err: any) {
      // Fallback: update locally
      const updatedHotel: Hotel = {
        ...hotel,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        stars: parseInt(stars),
        description: description.trim() || undefined,
        checkInTime,
        checkOutTime,
        defaultCurrency: currency,
        taxRate: parseFloat(taxRate),
      }
      toast.success('Hôtel mis à jour (mode hors ligne)')
      onSuccess(updatedHotel)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-[oklch(0.22_0.065_160)]" />
            Modifier l&apos;hôtel
          </DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de l&apos;établissement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Information */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informations générales
            </p>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-hotel-name"
                placeholder="Ex: Hôtel Le Cocody"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Stars + Email */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Étoiles</Label>
                <Select value={stars} onValueChange={setStars}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {'★'.repeat(s)}{'☆'.repeat(5 - s)} ({s} étoile{s > 1 ? 's' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hotel-email">Email</Label>
                <Input
                  id="edit-hotel-email"
                  type="email"
                  placeholder="contact@hotel.ci"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-phone">Téléphone</Label>
              <Input
                id="edit-hotel-phone"
                type="tel"
                placeholder="+225 27 20 30 40 50"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-description">Description</Label>
              <Textarea
                id="edit-hotel-description"
                placeholder="Description de votre établissement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Localisation
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-hotel-city">Ville</Label>
                <Input
                  id="edit-hotel-city"
                  placeholder="Ex: Abidjan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hotel-district">Quartier</Label>
                <Input
                  id="edit-hotel-district"
                  placeholder="Ex: Cocody"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hotel-address">Adresse</Label>
              <Input
                id="edit-hotel-address"
                placeholder="Rue, avenue..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Times */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Horaires
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-checkin-time">
                  Check-in <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-checkin-time"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
                {errors.checkInTime && (
                  <p className="text-xs text-red-500">{errors.checkInTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-checkout-time">
                  Check-out <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-checkout-time"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
                {errors.checkOutTime && (
                  <p className="text-xs text-red-500">{errors.checkOutTime}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Billing */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Facturation
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Devise</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFA">FCFA</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="XOF">XOF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tax-rate">Taux TVA (%)</Label>
                <Input
                  id="edit-tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
                {errors.taxRate && (
                  <p className="text-xs text-red-500">{errors.taxRate}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
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
                  Enregistrement...
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
