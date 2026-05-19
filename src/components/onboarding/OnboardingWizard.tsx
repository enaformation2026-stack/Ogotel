'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  BedDouble,
  Loader2,
  Sparkles,
  Hotel,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
}

interface RoomTypeForm {
  id: string
  name: string
  basePrice: number
  maxOccupancy: number
  bedCount: number
}

interface RoomForm {
  id: string
  number: string
  floor: string
  roomTypeId: string
}

type WizardStep = 1 | 2 | 3 | 4

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Bienvenue' },
  { num: 2, label: 'Types de chambre' },
  { num: 3, label: 'Chambres' },
  { num: 4, label: 'Terminé' },
]

const SUGGESTED_ROOM_TYPES: Omit<RoomTypeForm, 'id'>[] = [
  { name: 'Standard', basePrice: 25000, maxOccupancy: 2, bedCount: 1 },
  { name: 'Deluxe', basePrice: 45000, maxOccupancy: 2, bedCount: 1 },
  { name: 'Suite', basePrice: 75000, maxOccupancy: 3, bedCount: 1 },
]

// ── Animation ─────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

// ── Component ────────────────────────────────────────────────────────────────

export function OnboardingWizard({
  open,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [direction, setDirection] = useState(0)

  // Step 1: Hotel name
  const [hotelName, setHotelName] = useState('')
  const [hotelCity, setHotelCity] = useState('')
  const [hotelStars, setHotelStars] = useState(3)

  // Step 2: Room types
  const [roomTypes, setRoomTypes] = useState<RoomTypeForm[]>([])

  // Step 3: Rooms
  const [rooms, setRooms] = useState<RoomForm[]>([])

  // General
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1)
      setHotelName('')
      setHotelCity('')
      setHotelStars(3)
      setRoomTypes([])
      setRooms([])
    }
  }, [open])

  if (!open) return null

  const totalSteps = 4
  const progressValue = ((step - 1) / (totalSteps - 1)) * 100

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 4) as WizardStep)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1) as WizardStep)
  }

  // ── Step 1: Can proceed? ─────────────────────────────────────────────
  const canGoStep1 = hotelName.trim().length >= 2

  // ── Step 2: Room types management ────────────────────────────────────
  const addRoomType = (preset?: Omit<RoomTypeForm, 'id'>) => {
    setRoomTypes((prev) => [
      ...prev,
      {
        id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: preset?.name ?? '',
        basePrice: preset?.basePrice ?? 25000,
        maxOccupancy: preset?.maxOccupancy ?? 2,
        bedCount: preset?.bedCount ?? 1,
      },
    ])
  }

  const removeRoomType = (id: string) => {
    setRoomTypes((prev) => prev.filter((rt) => rt.id !== id))
    // Also remove rooms referencing this type
    setRooms((prev) => prev.filter((r) => r.roomTypeId !== id))
  }

  const updateRoomType = (id: string, data: Partial<RoomTypeForm>) => {
    setRoomTypes((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...data } : rt)))
  }

  const canGoStep2 = roomTypes.length > 0 && roomTypes.every((rt) => rt.name.trim().length >= 2 && rt.basePrice > 0)

  // ── Step 3: Rooms management ─────────────────────────────────────────
  const addRoom = () => {
    if (roomTypes.length === 0) return
    setRooms((prev) => [
      ...prev,
      {
        id: `rm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        number: '',
        floor: '',
        roomTypeId: roomTypes[0].id,
      },
    ])
  }

  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRoom = (id: string, data: Partial<RoomForm>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }

  const canGoStep3 = rooms.length > 0 && rooms.every((r) => r.number.trim().length >= 1)

  // ── Submit ────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Configuration terminée ! Bienvenue dans OGOTEL CLOUD 🎉')
      onComplete()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(0.22_0.065_160)] to-[oklch(0.15_0.05_160)] p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[oklch(0.22_0.065_160)]">
                <Hotel className="size-5 text-white" />
              </div>
              <span className="text-lg font-bold text-[oklch(0.22_0.065_160)]">
                OGOTEL CLOUD
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onSkip}>
              <X className="size-4 mr-1" />
              Passer
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2">
              {STEPS.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      s.num < step
                        ? 'bg-emerald-500 text-white'
                        : s.num === step
                          ? 'bg-[oklch(0.22_0.065_160)] text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.num < step ? <Check className="size-3.5" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs ${
                      s.num === step ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px ${
                        s.num < step ? 'bg-emerald-300' : 'bg-border'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <Progress value={progressValue} className="h-1" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Welcome + Hotel Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-[oklch(0.22_0.065_160)]/10">
                        <Building2 className="size-8 text-[oklch(0.22_0.065_160)]" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">Bienvenue sur OGOTEL CLOUD ! 🎉</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Configurons votre hôtel en quelques étapes rapides. Commencez par
                      entrer le nom de votre établissement.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-sm mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-name">
                        Nom de l&apos;hôtel <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hotel-name"
                        placeholder="Ex: Hôtel Le Cocody"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-city">Ville</Label>
                      <Input
                        id="hotel-city"
                        placeholder="Ex: Abidjan"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre d&apos;étoiles</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setHotelStars(s)}
                            className="focus:outline-none"
                          >
                            <svg
                              className={`size-8 transition-colors ${
                                s <= hotelStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200 fill-gray-200'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Room Types */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">Types de chambre</h2>
                    <p className="text-muted-foreground">
                      Créez les catégories de chambres de votre hôtel avec leurs tarifs.
                    </p>
                  </div>

                  {/* Quick add presets */}
                  {roomTypes.length === 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Ajouter rapidement des types courants :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_ROOM_TYPES.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => addRoomType(preset)}
                          >
                            <Plus className="size-3" />
                            {preset.name} ({new Intl.NumberFormat('fr-FR').format(preset.basePrice)} FCFA)
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room types list */}
                  <div className="space-y-3">
                    {roomTypes.map((rt, idx) => (
                      <div key={rt.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">
                            Type {idx + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeRoomType(rt.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nom</Label>
                            <Input
                              placeholder="Standard"
                              value={rt.name}
                              onChange={(e) => updateRoomType(rt.id, { name: e.target.value })}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Prix / nuit (FCFA)</Label>
                            <Input
                              type="number"
                              min={0}
                              value={rt.basePrice}
                              onChange={(e) =>
                                updateRoomType(rt.id, {
                                  basePrice: Math.max(0, parseInt(e.target.value) || 0),
                                })
                              }
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Max. occupants</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={rt.maxOccupancy}
                              onChange={(e) =>
                                updateRoomType(rt.id, {
                                  maxOccupancy: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nb. lits</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={rt.bedCount}
                              onChange={(e) =>
                                updateRoomType(rt.id, {
                                  bedCount: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {roomTypes.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-dashed"
                        onClick={() => addRoomType()}
                      >
                        <Plus className="size-4" />
                        Ajouter un type
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Rooms */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">Vos chambres</h2>
                    <p className="text-muted-foreground">
                      Ajoutez les chambres de votre hôtel.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto">
                    {rooms.map((room, idx) => {
                      const rt = roomTypes.find((t) => t.id === room.roomTypeId)
                      return (
                        <div key={room.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-medium">
                              Chambre {idx + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeRoom(room.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px]">Numéro</Label>
                              <Input
                                placeholder="101"
                                value={room.number}
                                onChange={(e) => updateRoom(room.id, { number: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Étage</Label>
                              <Input
                                placeholder="RDC"
                                value={room.floor}
                                onChange={(e) => updateRoom(room.id, { floor: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Type</Label>
                              <select
                                value={room.roomTypeId}
                                onChange={(e) => updateRoom(room.id, { roomTypeId: e.target.value })}
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                {roomTypes.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {rt && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              💰 {new Intl.NumberFormat('fr-FR').format(rt.basePrice)} FCFA/nuit · {rt.maxOccupancy} pers.
                            </p>
                          )}
                        </div>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-dashed"
                      onClick={addRoom}
                    >
                      <Plus className="size-4" />
                      Ajouter une chambre
                    </Button>
                  </div>

                  {rooms.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-sm font-medium">
                        {rooms.length} chambre{rooms.length > 1 ? 's' : ''} configurée{rooms.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Complete */}
              {step === 4 && (
                <div className="text-center space-y-6 py-8">
                  <div className="flex justify-center mb-4">
                    <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <Sparkles className="size-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Tout est prêt ! 🎉
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Votre hôtel <span className="font-semibold text-foreground">&laquo; {hotelName || 'Mon hôtel'} &raquo;</span> a été configuré avec{' '}
                    {rooms.length} chambre{rooms.length > 1 ? 's' : ''} réparties en{' '}
                    {roomTypes.length} type{roomTypes.length > 1 ? 's' : ''}.
                  </p>

                  <div className="flex justify-center gap-6 py-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <BedDouble className="size-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{rooms.length}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Chambres</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{roomTypes.length}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Types</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 && step < 4 ? (
              <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
                <ArrowLeft className="size-4 mr-1.5" />
                Retour
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                onClick={goNext}
                disabled={
                  isSubmitting ||
                  (step === 1 && !canGoStep1) ||
                  (step === 2 && !canGoStep2) ||
                  (step === 3 && !canGoStep3)
                }
                className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
              >
                Suivant
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-1.5" />
                    Commencer
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
