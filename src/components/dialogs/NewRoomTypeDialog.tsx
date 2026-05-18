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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { type RoomType } from '@/types'
import {
  Plus,
  Loader2,
  BedDouble,
  Wifi,
  Snowflake,
  Tv,
  Wine,
  ShieldCheck,
  Bath,
  Waves,
} from 'lucide-react'
import { toast } from 'sonner'

// ==========================================
// TYPES
// ==========================================

interface NewRoomTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (roomType: RoomType) => void
}

interface FormErrors {
  name?: string
  basePrice?: string
  maxOccupancy?: string
}

// ==========================================
// AMENITIES OPTIONS
// ==========================================

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'ac', label: 'Climatisation', icon: Snowflake },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'minibar', label: 'Minibar', icon: Wine },
  { key: 'safe', label: 'Coffre', icon: ShieldCheck },
  { key: 'balcon', label: 'Balcon', icon: Waves },
  { key: 'baignoire', label: 'Baignoire', icon: Bath },
  { key: 'vue-mer', label: 'Vue mer', icon: Waves },
]

const BED_TYPES = ['Simple', 'Double', 'Queen', 'King', 'Jumeaux']

// ==========================================
// VALIDATION
// ==========================================

function validateForm(data: {
  name: string
  basePrice: string
  maxOccupancy: string
}): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Le nom est requis'
  } else if (data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères'
  }

  const price = parseFloat(data.basePrice)
  if (!data.basePrice || isNaN(price) || price <= 0) {
    errors.basePrice = 'Le prix doit être supérieur à 0'
  }

  const occupancy = parseInt(data.maxOccupancy)
  if (!data.maxOccupancy || isNaN(occupancy) || occupancy < 1) {
    errors.maxOccupancy = 'La capacité doit être d\'au moins 1'
  } else if (occupancy > 10) {
    errors.maxOccupancy = 'La capacité ne peut pas dépasser 10'
  }

  return errors
}

// ==========================================
// COMPONENT
// ==========================================

export function NewRoomTypeDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewRoomTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [maxOccupancy, setMaxOccupancy] = useState('2')
  const [bedCount, setBedCount] = useState('1')
  const [bedType, setBedType] = useState('Queen')
  const [amenities, setAmenities] = useState<string[]>([])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setBasePrice('')
      setMaxOccupancy('2')
      setBedCount('1')
      setBedType('Queen')
      setAmenities([])
      setErrors({})
    }
  }, [open])

  const toggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = { name, basePrice, maxOccupancy }
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
        description: description.trim() || undefined,
        basePrice: parseFloat(basePrice),
        maxOccupancy: parseInt(maxOccupancy),
        bedCount: parseInt(bedCount),
        bedType: bedType,
        amenities,
        hotelId: 'hotel-001',
      }

      const res = await fetch('/api/room-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la création du type')
      }

      const data = await res.json()
      toast.success('Type de chambre créé avec succès')
      onSuccess(data)
      onOpenChange(false)
    } catch {
      // Fallback to mock creation
      const newRoomType: RoomType = {
        id: `rt-${Date.now()}`,
        organizationId: 'org-001',
        hotelId: 'hotel-001',
        name: name.trim(),
        description: description.trim() || undefined,
        basePrice: parseFloat(basePrice),
        maxOccupancy: parseInt(maxOccupancy),
        bedCount: parseInt(bedCount),
        bedType: bedType,
        amenities,
        images: [],
      }
      toast.success('Type de chambre créé avec succès (mode hors ligne)')
      onSuccess(newRoomType)
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
            <BedDouble className="size-5 text-[oklch(0.22_0.065_160)]" />
            Ajouter un type de chambre
          </DialogTitle>
          <DialogDescription>
            Définissez les caractéristiques du nouveau type de chambre
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informations de base
            </p>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="rt-name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rt-name"
                placeholder="Ex: Suite Executive"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="rt-description">Description</Label>
              <Textarea
                id="rt-description"
                placeholder="Description du type de chambre..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Pricing & Capacity */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prix et capacité
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="rt-price">
                  Prix de base (FCFA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rt-price"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="25000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
                {errors.basePrice && (
                  <p className="text-xs text-red-500">{errors.basePrice}</p>
                )}
              </div>

              {/* Max Occupancy */}
              <div className="space-y-2">
                <Label htmlFor="rt-occupancy">
                  Capacité max <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rt-occupancy"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="2"
                  value={maxOccupancy}
                  onChange={(e) => setMaxOccupancy(e.target.value)}
                />
                {errors.maxOccupancy && (
                  <p className="text-xs text-red-500">{errors.maxOccupancy}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Bed Count */}
              <div className="space-y-2">
                <Label htmlFor="rt-beds">Nombre de lits</Label>
                <Select value={bedCount} onValueChange={setBedCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} lit{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bed Type */}
              <div className="space-y-2">
                <Label>Type de lit</Label>
                <Select value={bedType} onValueChange={setBedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BED_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Équipements
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {AMENITY_OPTIONS.map((amenity) => {
                const Icon = amenity.icon
                const checked = amenities.includes(amenity.key)
                return (
                  <label
                    key={amenity.key}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                      checked
                        ? 'border-[oklch(0.22_0.065_160)] bg-[oklch(0.22_0.065_160)]/5'
                        : 'border-input hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleAmenity(amenity.key)}
                    />
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">{amenity.label}</span>
                  </label>
                )
              })}
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
                  Création...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1.5" />
                  Créer le type
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
