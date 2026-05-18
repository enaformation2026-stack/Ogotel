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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface NewGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (guest: any) => void
  defaultValues?: Partial<GuestFormData>
}

export interface GuestFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  country: string
  city: string
  idNumber: string
  isVip: boolean
  isCorporate: boolean
}

// ── African Countries ───────────────────────────────────────────────────────

const AFRICAN_COUNTRIES = [
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "SN", label: "Sénégal" },
  { value: "ML", label: "Mali" },
  { value: "BF", label: "Burkina Faso" },
  { value: "CM", label: "Cameroun" },
  { value: "GN", label: "Guinée" },
  { value: "BJ", label: "Bénin" },
  { value: "TG", label: "Togo" },
  { value: "NE", label: "Niger" },
  { value: "MR", label: "Mauritanie" },
  { value: "GN-B", label: "Guinée-Bissau" },
  { value: "CV", label: "Cap-Vert" },
  { value: "GM", label: "Gambie" },
  { value: "LR", label: "Libéria" },
  { value: "SL", label: "Sierra Leone" },
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "TD", label: "Tchad" },
  { value: "CF", label: "Rép. Centrafricaine" },
  { value: "CG", label: "Congo-Brazzaville" },
  { value: "CD", label: "RD Congo" },
  { value: "GA", label: "Gabon" },
  { value: "GQ", label: "Guinée équatoriale" },
  { value: "ST", label: "Sao Tomé et Príncipe" },
  { value: "ET", label: "Éthiopie" },
  { value: "ER", label: "Érythrée" },
  { value: "DJ", label: "Djibouti" },
  { value: "SO", label: "Somalie" },
  { value: "KE", label: "Kenya" },
  { value: "TZ", label: "Tanzanie" },
  { value: "UG", label: "Ouganda" },
  { value: "RW", label: "Rwanda" },
  { value: "BI", label: "Burundi" },
  { value: "MG", label: "Madagascar" },
  { value: "MU", label: "Maurice" },
  { value: "SC", label: "Seychelles" },
  { value: "KM", label: "Comores" },
  { value: "MZ", label: "Mozambique" },
  { value: "ZW", label: "Zimbabwe" },
  { value: "ZM", label: "Zambie" },
  { value: "MW", label: "Malawi" },
  { value: "AO", label: "Angola" },
  { value: "NA", label: "Namibie" },
  { value: "BW", label: "Botswana" },
  { value: "ZA", label: "Afrique du Sud" },
  { value: "SZ", label: "Eswatini" },
  { value: "LS", label: "Lesotho" },
  { value: "TN", label: "Tunisie" },
  { value: "DZ", label: "Algérie" },
  { value: "MA", label: "Maroc" },
  { value: "LY", label: "Libye" },
  { value: "EG", label: "Égypte" },
  { value: "SD", label: "Soudan" },
  { value: "SS", label: "Soudan du Sud" },
  { value: "OTHER", label: "Autre" },
]

// Nationality map for common French-speaking countries
const NATIONALITY_MAP: Record<string, string> = {
  CI: "Ivoirienne",
  SN: "Sénégalaise",
  ML: "Malian",
  BF: "Burkinabè",
  CM: "Camerounaise",
  GN: "Guinéenne",
  BJ: "Béninoise",
  TG: "Togolaise",
  NE: "Nigérienne",
  MR: "Mauritanienne",
  GN_B: "Bissau-Guinéenne",
  GH: "Ghanéenne",
  NG: "Nigériane",
  TD: "Tchadienne",
  CG: "Congolaise",
  CD: "Congolaise (RDC)",
  GA: "Gabonaise",
  ET: "Éthiopienne",
  KE: "Kényane",
  TZ: "Tanzanienne",
  UG: "Ougandaise",
  RW: "Rwandaise",
  MG: "Malgache",
  MA: "Marocaine",
  DZ: "Algérienne",
  TN: "Tunisienne",
  EG: "Égyptienne",
}

// ── Inline Validation ───────────────────────────────────────────────────────

function validateGuestForm(data: GuestFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.firstName.trim()) errors.firstName = 'Le prénom est requis'
  if (!data.lastName.trim()) errors.lastName = 'Le nom est requis'

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide'
  }

  if (data.phone && !/^[\+\d\s\-()]{6,20}$/.test(data.phone)) {
    errors.phone = 'Numéro de téléphone invalide'
  }

  return errors
}

// ── Component ───────────────────────────────────────────────────────────────

export function NewGuestDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
}: NewGuestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [firstName, setFirstName] = useState(defaultValues?.firstName ?? '')
  const [lastName, setLastName] = useState(defaultValues?.lastName ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [nationality, setNationality] = useState(defaultValues?.nationality ?? 'CI')
  const [country, setCountry] = useState(defaultValues?.country ?? 'CI')
  const [city, setCity] = useState(defaultValues?.city ?? '')
  const [idNumber, setIdNumber] = useState(defaultValues?.idNumber ?? '')
  const [isVip, setIsVip] = useState(defaultValues?.isVip ?? false)
  const [isCorporate, setIsCorporate] = useState(defaultValues?.isCorporate ?? false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFirstName(defaultValues?.firstName ?? '')
      setLastName(defaultValues?.lastName ?? '')
      setEmail(defaultValues?.email ?? '')
      setPhone(defaultValues?.phone ?? '')
      setNationality(defaultValues?.nationality ?? 'CI')
      setCountry(defaultValues?.country ?? 'CI')
      setCity(defaultValues?.city ?? '')
      setIdNumber(defaultValues?.idNumber ?? '')
      setIsVip(defaultValues?.isVip ?? false)
      setIsCorporate(defaultValues?.isCorporate ?? false)
      setErrors({})
    }
  }, [open, defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData: GuestFormData = {
      firstName,
      lastName,
      email,
      phone,
      nationality: NATIONALITY_MAP[nationality] || nationality,
      country: AFRICAN_COUNTRIES.find((c) => c.value === nationality)?.label || '',
      city,
      idNumber,
      isVip,
      isCorporate,
    }

    const validationErrors = validateGuestForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: [
            ...(isVip ? ['VIP'] : []),
            ...(isCorporate ? ['Corporate'] : []),
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de la création du client")
      }

      const guest = await res.json()
      toast.success('Client créé avec succès')
      onSuccess(guest)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-set nationality when country changes
  const handleCountryChange = (value: string) => {
    setCountry(value)
    if (!nationality) {
      setNationality(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-[oklch(0.22_0.065_160)]" />
            Nouveau client
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouveau client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guest-firstName">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guest-firstName"
                placeholder="Aminata"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }))
                }}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-lastName">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guest-lastName"
                placeholder="Koné"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }))
                }}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email</Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-phone">Téléphone</Label>
              <Input
                id="guest-phone"
                type="tel"
                placeholder="+225 05 01 02 03"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                }}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Nationality & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nationalité</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nationalité" />
                </SelectTrigger>
                <SelectContent>
                  {AFRICAN_COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {NATIONALITY_MAP[c.value] || c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  {AFRICAN_COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="guest-city">Ville</Label>
            <Input
              id="guest-city"
              placeholder="Abidjan"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <Label htmlFor="guest-idNumber">N° pièce d&apos;identité</Label>
            <Input
              id="guest-idNumber"
              placeholder="Ex: CI-12345678"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="guest-vip"
                  checked={isVip}
                  onCheckedChange={(checked) => setIsVip(checked === true)}
                />
                <Label htmlFor="guest-vip" className="font-normal cursor-pointer">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full bg-amber-500" />
                    VIP — Client privilégié
                  </span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="guest-corporate"
                  checked={isCorporate}
                  onCheckedChange={(checked) => setIsCorporate(checked === true)}
                />
                <Label htmlFor="guest-corporate" className="font-normal cursor-pointer">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full bg-blue-500" />
                    Corporate — Client d&apos;entreprise
                  </span>
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
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
                  <UserPlus className="size-4 mr-1.5" />
                  Créer le client
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
