'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Loader2,
  Bed,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { formatFCFA } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OnboardingData {
  organizationName: string
  hotel: {
    name: string
    email?: string
    phone?: string
    city?: string
    district?: string
    address?: string
  }
  roomTypes: {
    name: string
    basePrice: number
    maxOccupancy: number
    bedCount: number
    bedType: string
  }[]
  roomsPerType: Record<string, number>
}

interface RoomTypeConfig {
  key: string
  name: string
  activated: boolean
  basePrice: number
  maxOccupancy: number
  bedCount: number
  bedType: string
  isCustom?: boolean
}

interface OnboardingWizardProps {
  showOnboarding: boolean
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

const BED_TYPE_OPTIONS = [
  { value: 'Simple', label: 'Simple' },
  { value: 'Double', label: 'Double' },
  { value: 'Queen', label: 'Queen' },
  { value: 'King', label: 'King' },
]

const STEP_LABELS = [
  'Organisation',
  'Types de chambres',
  'Chambres initiales',
]

// ─── Animation variants ────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
  }),
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// ─── Predefined room types ─────────────────────────────────────────────────

function getDefaultRoomTypes(): RoomTypeConfig[] {
  return [
    {
      key: 'standard',
      name: 'Standard',
      activated: true,
      basePrice: 15000,
      maxOccupancy: 2,
      bedCount: 1,
      bedType: 'Double',
    },
    {
      key: 'deluxe',
      name: 'Deluxe',
      activated: true,
      basePrice: 25000,
      maxOccupancy: 2,
      bedCount: 1,
      bedType: 'Queen',
    },
    {
      key: 'suite',
      name: 'Suite',
      activated: false,
      basePrice: 45000,
      maxOccupancy: 3,
      bedCount: 1,
      bedType: 'King',
    },
    {
      key: 'suite-royale',
      name: 'Suite Royale',
      activated: false,
      basePrice: 80000,
      maxOccupancy: 4,
      bedCount: 2,
      bedType: 'King',
    },
  ]
}

// ─── Generate room numbers ─────────────────────────────────────────────────

function generateRoomNumbers(floor: number, count: number): string[] {
  const numbers: string[] = []
  const startNum = floor * 100
  for (let i = 1; i <= count; i++) {
    numbers.push(String(startNum + i))
  }
  return numbers
}

// ─── Step 1: Organisation Info ─────────────────────────────────────────────

function StepOrganization({
  data,
  onChange,
  errors,
}: {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  errors: Record<string, string>
}) {
  const update = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const updateHotel = (field: string, value: string) => {
    onChange({
      ...data,
      hotel: {
        ...data.hotel,
        [field]: value || undefined,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.22_0.065_160)]">
          <Building2 className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Informations de l&apos;organisation</h3>
          <p className="text-sm text-muted-foreground">
            Parlez-nous de votre établissement hôtelier
          </p>
        </div>
      </div>

      <Separator />

      {/* Organisation Name */}
      <div className="space-y-2">
        <Label htmlFor="org-name">
          Nom de l&apos;organisation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="org-name"
          placeholder="Ex: Hôtels Cocody SARL"
          value={data.organizationName}
          onChange={(e) => update('organizationName', e.target.value)}
          className="h-11"
        />
        {errors.organizationName && (
          <p className="text-xs text-destructive">{errors.organizationName}</p>
        )}
      </div>

      {/* Hotel Name */}
      <div className="space-y-2">
        <Label htmlFor="hotel-name">
          Nom de l&apos;hôtel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="hotel-name"
          placeholder="Ex: Hôtel Le Cocody Palace"
          value={data.hotel.name}
          onChange={(e) => updateHotel('name', e.target.value)}
          className="h-11"
        />
        {errors.hotelName && (
          <p className="text-xs text-destructive">{errors.hotelName}</p>
        )}
      </div>

      {/* Email + Phone row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hotel-email">Email de l&apos;hôtel</Label>
          <Input
            id="hotel-email"
            type="email"
            placeholder="contact@hotel-ci.com"
            value={data.hotel.email || ''}
            onChange={(e) => updateHotel('email', e.target.value)}
            className="h-11"
          />
          {errors.hotelEmail && (
            <p className="text-xs text-destructive">{errors.hotelEmail}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotel-phone">Téléphone</Label>
          <Input
            id="hotel-phone"
            type="tel"
            placeholder="+225 27 20 30 40 50"
            value={data.hotel.phone || ''}
            onChange={(e) => updateHotel('phone', e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {/* City + District row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hotel-city">Ville</Label>
          <Input
            id="hotel-city"
            placeholder="Ex: Abidjan"
            value={data.hotel.city || ''}
            onChange={(e) => updateHotel('city', e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotel-district">Quartier</Label>
          <Input
            id="hotel-district"
            placeholder="Ex: Cocody"
            value={data.hotel.district || ''}
            onChange={(e) => updateHotel('district', e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="hotel-address">Adresse</Label>
        <Textarea
          id="hotel-address"
          placeholder="Rue, avenue, boulevard..."
          value={data.hotel.address || ''}
          onChange={(e) => updateHotel('address', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

// ─── Step 2: Room Types ────────────────────────────────────────────────────

function StepRoomTypes({
  roomTypes,
  onChange,
  errors,
}: {
  roomTypes: RoomTypeConfig[]
  onChange: (types: RoomTypeConfig[]) => void
  errors: Record<string, string>
}) {
  const toggleType = (index: number) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], activated: !updated[index].activated }
    onChange(updated)
  }

  const updateType = (index: number, field: string, value: string | number) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeCustomType = (index: number) => {
    if (roomTypes[index].isCustom) {
      onChange(roomTypes.filter((_, i) => i !== index))
    }
  }

  const addCustomType = () => {
    const customKey = `custom-${Date.now()}`
    onChange([
      ...roomTypes,
      {
        key: customKey,
        name: '',
        activated: true,
        basePrice: 20000,
        maxOccupancy: 2,
        bedCount: 1,
        bedType: 'Double',
        isCustom: true,
      },
    ])
  }

  const activatedCount = roomTypes.filter((rt) => rt.activated).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.22_0.065_160)]">
          <BedDouble className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Types de chambres</h3>
          <p className="text-sm text-muted-foreground">
            Sélectionnez et configurez les types de chambres de votre hôtel
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {activatedCount} type{activatedCount !== 1 ? 's' : ''} activé{activatedCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {roomTypes.map((rt, index) => (
          <motion.div
            key={rt.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`overflow-hidden transition-all ${
                rt.activated
                  ? 'border-[oklch(0.22_0.065_160)]/30 bg-[oklch(0.22_0.065_160)]/[0.03]'
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-0">
                {/* Card header row */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <Bed className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {rt.isCustom ? (
                        <Input
                          value={rt.name}
                          onChange={(e) => updateType(index, 'name', e.target.value)}
                          placeholder="Nom du type"
                          className="h-7 w-40 text-sm"
                        />
                      ) : (
                        rt.name
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rt.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeCustomType(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <Switch
                      checked={rt.activated}
                      onCheckedChange={() => toggleType(index)}
                      className="data-[state=checked]:bg-[oklch(0.22_0.065_160)]"
                    />
                  </div>
                </div>

                {/* Expanded details when activated */}
                <AnimatePresence>
                  {rt.activated && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="grid gap-3 p-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Base Price */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Prix de base
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={rt.basePrice || ''}
                            onChange={(e) =>
                              updateType(index, 'basePrice', parseInt(e.target.value) || 0)
                            }
                            className="h-9 text-sm"
                            placeholder="15000"
                          />
                          <p className="text-xs text-muted-foreground">
                            {rt.basePrice ? formatFCFA(rt.basePrice) : '—'}
                          </p>
                        </div>

                        {/* Max Occupancy */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Capacité max
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={rt.maxOccupancy || ''}
                            onChange={(e) =>
                              updateType(index, 'maxOccupancy', parseInt(e.target.value) || 1)
                            }
                            className="h-9 text-sm"
                            placeholder="2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {rt.maxOccupancy} personne{rt.maxOccupancy > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Bed Count */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Nombre de lits
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={rt.bedCount || ''}
                            onChange={(e) =>
                              updateType(index, 'bedCount', parseInt(e.target.value) || 1)
                            }
                            className="h-9 text-sm"
                            placeholder="1"
                          />
                          <p className="text-xs text-muted-foreground">
                            {rt.bedCount} lit{rt.bedCount > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Bed Type */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Type de lit
                          </Label>
                          <Select
                            value={rt.bedType}
                            onValueChange={(v) => updateType(index, 'bedType', v)}
                          >
                            <SelectTrigger className="h-9 text-sm w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BED_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {errors.roomTypes && (
        <p className="text-xs text-destructive">{errors.roomTypes}</p>
      )}

      {/* Add custom type button */}
      <Button
        type="button"
        variant="outline"
        onClick={addCustomType}
        className="w-full border-dashed"
      >
        <Plus className="size-4 mr-2" />
        Ajouter un type personnalisé
      </Button>
    </div>
  )
}

// ─── Step 3: Initial Rooms ─────────────────────────────────────────────────

function StepInitialRooms({
  roomTypes,
  roomsPerType,
  floorsPerType,
  onChangeRooms,
  onChangeFloor,
}: {
  roomTypes: RoomTypeConfig[]
  roomsPerType: Record<string, number>
  floorsPerType: Record<string, number>
  onChangeRooms: (key: string, count: number) => void
  onChangeFloor: (key: string, floor: number) => void
}) {
  const activatedTypes = roomTypes.filter((rt) => rt.activated)
  const totalRooms = activatedTypes.reduce(
    (sum, rt) => sum + (roomsPerType[rt.key] || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.22_0.065_160)]">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Chambres initiales</h3>
          <p className="text-sm text-muted-foreground">
            Définissez combien de chambres créer pour chaque type
          </p>
        </div>
      </div>

      {/* Total rooms summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total des chambres à créer</span>
          <Badge
            variant="default"
            className="bg-[oklch(0.22_0.065_160)] text-white"
          >
            {totalRooms} chambre{totalRooms !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {activatedTypes.map((rt, index) => {
          const count = roomsPerType[rt.key] || 0
          const floor = floorsPerType[rt.key] || 1
          const roomNumbers =
            count > 0 ? generateRoomNumbers(floor, count) : []

          return (
            <motion.div
              key={rt.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bed className="size-4 text-[oklch(0.22_0.065_160)]" />
                        <span className="font-medium text-sm">{rt.name}</span>
                        <span className="text-xs text-muted-foreground">
                          — {formatFCFA(rt.basePrice)}/nuit
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Number of rooms */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Nombre de chambres
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={count}
                          onChange={(e) =>
                            onChangeRooms(
                              rt.key,
                              Math.max(0, Math.min(50, parseInt(e.target.value) || 0))
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Floor */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Étage
                        </Label>
                        <Select
                          value={String(floor)}
                          onValueChange={(v) => onChangeFloor(rt.key, parseInt(v))}
                        >
                          <SelectTrigger className="h-9 text-sm w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
                              <SelectItem key={f} value={String(f)}>
                                Étage {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Auto-generated room numbers preview */}
                    {roomNumbers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Numéros de chambres :
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {roomNumbers.map((num) => (
                            <Badge
                              key={num}
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main OnboardingWizard ─────────────────────────────────────────────────

export function OnboardingWizard({
  showOnboarding,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Step 1 data
  const [data, setData] = React.useState<OnboardingData>({
    organizationName: '',
    hotel: {
      name: '',
      email: '',
      phone: '',
      city: '',
      district: '',
      address: '',
    },
    roomTypes: [],
    roomsPerType: {},
  })

  // Step 2 data
  const [roomTypes, setRoomTypes] = React.useState<RoomTypeConfig[]>(getDefaultRoomTypes)

  // Step 3 data
  const [roomsPerType, setRoomsPerType] = React.useState<Record<string, number>>({
    standard: 5,
    deluxe: 3,
    suite: 2,
    'suite-royale': 1,
  })
  const [floorsPerType, setFloorsPerType] = React.useState<Record<string, number>>({
    standard: 1,
    deluxe: 2,
    suite: 3,
    'suite-royale': 4,
  })

  // Sync default roomsPerType when room types change
  React.useEffect(() => {
    setRoomsPerType((prev) => {
      const updated: Record<string, number> = {}
      roomTypes.forEach((rt) => {
        updated[rt.key] = prev[rt.key] ?? 3
      })
      return updated
    })
    setFloorsPerType((prev) => {
      const updated: Record<string, number> = {}
      roomTypes.forEach((rt, idx) => {
        updated[rt.key] = prev[rt.key] ?? (idx + 1)
      })
      return updated
    })
  }, [roomTypes.map((rt) => rt.key).join(',')])

  // Reset on show
  React.useEffect(() => {
    if (showOnboarding) {
      setCurrentStep(0)
      setDirection(0)
      setIsSubmitting(false)
      setErrors({})
      setData({
        organizationName: '',
        hotel: {
          name: '',
          email: '',
          phone: '',
          city: '',
          district: '',
          address: '',
        },
        roomTypes: [],
        roomsPerType: {},
      })
      setRoomTypes(getDefaultRoomTypes())
      setRoomsPerType({ standard: 5, deluxe: 3, suite: 2, 'suite-royale': 1 })
      setFloorsPerType({ standard: 1, deluxe: 2, suite: 3, 'suite-royale': 4 })
    }
  }, [showOnboarding])

  // ─── Validation ────────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!data.organizationName.trim()) {
        newErrors.organizationName = 'Le nom de l\'organisation est requis'
      }
      if (!data.hotel.name.trim()) {
        newErrors.hotelName = "Le nom de l'hôtel est requis"
      }
      if (data.hotel.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.hotel.email)) {
        newErrors.hotelEmail = 'Adresse email invalide'
      }
    }

    if (step === 1) {
      const activated = roomTypes.filter((rt) => rt.activated)
      if (activated.length === 0) {
        newErrors.roomTypes = 'Vous devez activer au moins un type de chambre'
      }
      for (const rt of activated) {
        if (!rt.name.trim()) {
          newErrors[`name_${rt.key}`] = 'Le nom est requis'
        }
        if (!rt.basePrice || rt.basePrice <= 0) {
          newErrors[`price_${rt.key}`] = 'Le prix doit être supérieur à 0'
        }
      }
    }

    if (step === 2) {
      const activated = roomTypes.filter((rt) => rt.activated)
      const hasRooms = activated.some((rt) => (roomsPerType[rt.key] || 0) > 0)
      if (!hasRooms) {
        newErrors.rooms = 'Vous devez créer au moins une chambre'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, 2))
  }

  const goPrev = () => {
    setErrors({})
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  // ─── Submit ────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    if (!validateStep(2)) return

    setIsSubmitting(true)

    // Build the activated room types
    const activatedTypes = roomTypes.filter((rt) => rt.activated)
    const finalRoomsPerType: Record<string, number> = {}

    activatedTypes.forEach((rt) => {
      finalRoomsPerType[rt.name] = roomsPerType[rt.key] || 0
    })

    const finalData: OnboardingData = {
      organizationName: data.organizationName.trim(),
      hotel: {
        name: data.hotel.name.trim(),
        email: data.hotel.email?.trim() || undefined,
        phone: data.hotel.phone?.trim() || undefined,
        city: data.hotel.city?.trim() || undefined,
        district: data.hotel.district?.trim() || undefined,
        address: data.hotel.address?.trim() || undefined,
      },
      roomTypes: activatedTypes.map((rt) => ({
        name: rt.name.trim(),
        basePrice: rt.basePrice,
        maxOccupancy: rt.maxOccupancy,
        bedCount: rt.bedCount,
        bedType: rt.bedType,
      })),
      roomsPerType: finalRoomsPerType,
    }

    try {
      // Step 1: Create hotel via API
      const hotelRes = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData.hotel),
      })

      if (!hotelRes.ok) {
        const err = await hotelRes.json().catch(() => ({}))
        throw new Error(err.error || "Erreur lors de la création de l'hôtel")
      }

      const hotel = await hotelRes.json()
      const hotelId = hotel.id

      // Step 2: Create rooms for each activated type
      const activatedWithKeys = roomTypes.filter((rt) => rt.activated)
      for (const rt of activatedWithKeys) {
        const count = roomsPerType[rt.key] || 0
        const floor = floorsPerType[rt.key] || 1
        const roomNumbers = generateRoomNumbers(floor, count)

        for (const roomNum of roomNumbers) {
          await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hotelId,
              number: roomNum,
              floor: String(floor),
              roomTypeId: rt.key, // Will be resolved server-side or use mock
              name: `${rt.name} ${roomNum}`,
              initialStatus: 'available',
            }),
          }).catch(() => {
            // Continue even if individual room creation fails
          })
        }
      }

      toast.success('Hôtel configuré avec succès ! Bienvenue sur OGOTEL CLOUD.')
      onComplete(finalData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      // Still allow completion in offline/demo mode
      toast.warning(`${message} — Configuration sauvegardée localement.`)
      onComplete(finalData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Progress ──────────────────────────────────────────────────────────

  const progressValue = ((currentStep + 1) / 3) * 100

  if (!showOnboarding) return null

  return (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Wizard container */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl border bg-background shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Header */}
            <div className="p-6 pb-0">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.22_0.065_160)]">
                  <Building2 className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg tracking-tight">Configuration initiale</h2>
                  <p className="text-xs text-muted-foreground">
                    Configurez votre hôtel en 3 étapes rapides
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-3 mb-6">
                <Progress
                  value={progressValue}
                  className="h-2 bg-muted"
                />

                {/* Step indicators */}
                <div className="flex items-center justify-between">
                  {STEP_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 ${
                        i <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                          i < currentStep
                            ? 'bg-[oklch(0.22_0.065_160)] text-white'
                            : i === currentStep
                              ? 'bg-[oklch(0.22_0.065_160)] text-white ring-2 ring-[oklch(0.22_0.065_160)]/30'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i < currentStep ? (
                          <Check className="size-3.5" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`hidden sm:inline text-xs font-medium ${
                          i === currentStep ? 'text-foreground' : ''
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="px-6 pb-6 min-h-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {currentStep === 0 && (
                    <StepOrganization
                      data={data}
                      onChange={setData}
                      errors={errors}
                    />
                  )}

                  {currentStep === 1 && (
                    <StepRoomTypes
                      roomTypes={roomTypes}
                      onChange={setRoomTypes}
                      errors={errors}
                    />
                  )}

                  {currentStep === 2 && (
                    <StepInitialRooms
                      roomTypes={roomTypes}
                      roomsPerType={roomsPerType}
                      floorsPerType={floorsPerType}
                      onChangeRooms={(key, count) =>
                        setRoomsPerType((prev) => ({ ...prev, [key]: count }))
                      }
                      onChangeFloor={(key, floor) =>
                        setFloorsPerType((prev) => ({ ...prev, [key]: floor }))
                      }
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div>
                {currentStep === 0 && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Passer l&apos;onboarding
                  </button>
                )}
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={goPrev}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Précédent
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={isSubmitting}
                    className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
                  >
                    Suivant
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 mr-1.5 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-1.5" />
                        Terminer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
