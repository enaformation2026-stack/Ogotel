'use client'

import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_ROOM_TYPES } from '@/lib/mock-data'
import { formatFCFA, type RoomType } from '@/types'
import {
  Plus,
  Loader2,
  BedDouble,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface NewRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  hotelId: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function NewRoomDialog({
  open,
  onOpenChange,
  onSuccess,
  hotelId,
}: NewRoomDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [number, setNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [roomTypeId, setRoomTypeId] = useState('')
  const [name, setName] = useState('')

  // Fetch room types when dialog opens
  useEffect(() => {
    if (open) {
      // Try API first, fallback to mock
      fetch(`/api/rooms?hotelId=${hotelId}`)
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('API not available')
        })
        .then((data) => {
          if (data.roomTypes) setRoomTypes(data.roomTypes)
        })
        .catch(() => {
          // Fallback to mock data
          setRoomTypes(MOCK_ROOM_TYPES)
        })

      // Reset form
      setNumber('')
      setFloor('')
      setRoomTypeId('')
      setName('')
    }
  }, [open, hotelId])

  const selectedRoomType = useMemo(
    () => roomTypes.find((rt) => rt.id === roomTypeId),
    [roomTypes, roomTypeId]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!number.trim() || !roomTypeId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          number: number.trim(),
          floor: floor.trim() || undefined,
          roomTypeId,
          name: name.trim() || undefined,
          initialStatus: 'available',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de l'ajout de la chambre")
      }

      toast.success('Chambre ajoutée avec succès')
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="size-5 text-[oklch(0.22_0.065_160)]" />
            Ajouter une chambre
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de la nouvelle chambre
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="room-number">
              Numéro de chambre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="room-number"
              placeholder="Ex: 401"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoFocus
            />
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <Label htmlFor="room-floor">Étage</Label>
            <Input
              id="room-floor"
              placeholder="Ex: 3ème"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <Label>
              Type de chambre <span className="text-red-500">*</span>
            </Label>
            <Select value={roomTypeId} onValueChange={setRoomTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    <span className="flex items-center justify-between gap-4 w-full">
                      <span>{rt.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFCFA(rt.basePrice)}/nuit
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Type Info */}
          {selectedRoomType && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
              <p className="text-sm font-medium">{selectedRoomType.name}</p>
              {selectedRoomType.description && (
                <p className="text-xs text-muted-foreground">
                  {selectedRoomType.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Max {selectedRoomType.maxOccupancy} pers.</span>
                <span>·</span>
                <span>{selectedRoomType.bedCount} lit{selectedRoomType.bedCount > 1 ? 's' : ''}</span>
                {selectedRoomType.bedType && (
                  <>
                    <span>·</span>
                    <span>{selectedRoomType.bedType}</span>
                  </>
                )}
              </div>
              <p className="text-sm font-semibold text-[oklch(0.22_0.065_160)]">
                {formatFCFA(selectedRoomType.basePrice)} / nuit
              </p>
            </div>
          )}

          {/* Name (optional) */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Nom (optionnel)</Label>
            <Input
              id="room-name"
              placeholder="Ex: Suite Présidentielle"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              disabled={isSubmitting || !number.trim() || !roomTypeId}
              className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1.5" />
                  Ajouter la chambre
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
