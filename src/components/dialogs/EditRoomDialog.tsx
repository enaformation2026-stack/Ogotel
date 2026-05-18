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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_ROOM_TYPES, MOCK_ROOMS } from '@/lib/mock-data'
import { formatFCFA, type RoomType, type Room } from '@/types'
import {
  Pencil,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface EditRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  room: Room | null
}

// ── Component ───────────────────────────────────────────────────────────────

export function EditRoomDialog({
  open,
  onOpenChange,
  onSuccess,
  room,
}: EditRoomDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [number, setNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [roomTypeId, setRoomTypeId] = useState('')
  const [name, setName] = useState('')
  const [priceOverride, setPriceOverride] = useState('')
  const [maintenanceNotes, setMaintenanceNotes] = useState('')

  // Fetch room types and pre-fill form when dialog opens or room changes
  useEffect(() => {
    if (open && room) {
      // Try API first, fallback to mock
      fetch(`/api/rooms?hotelId=${room.hotelId}&roomTypes=true`)
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

      // Pre-fill form from room data
      setNumber(room.number || '')
      setFloor(room.floor || '')
      setRoomTypeId(room.roomTypeId || '')
      setName(room.name || '')
      setPriceOverride(room.priceOverride != null ? String(room.priceOverride) : '')
      setMaintenanceNotes(room.maintenanceNotes || '')
    }
  }, [open, room])

  const selectedRoomType = useMemo(
    () => roomTypes.find((rt) => rt.id === roomTypeId),
    [roomTypes, roomTypeId]
  )

  const isMaintenance = room?.status === 'maintenance'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!room) return
    if (!number.trim()) return

    setIsSubmitting(true)
    try {
      const payload: Record<string, any> = {
        number: number.trim(),
        floor: floor.trim() || null,
        roomTypeId,
        name: name.trim() || null,
        priceOverride: priceOverride.trim() ? Number(priceOverride) : null,
        maintenanceNotes: isMaintenance ? (maintenanceNotes.trim() || null) : null,
      }

      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de la modification de la chambre")
      }

      toast.success('Chambre modifiée avec succès')
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      // Mock fallback: update local array
      const idx = MOCK_ROOMS.findIndex((r) => r.id === room.id)
      if (idx !== -1) {
        MOCK_ROOMS[idx] = {
          ...MOCK_ROOMS[idx],
          number: number.trim(),
          floor: floor.trim() || undefined,
          roomTypeId,
          name: name.trim() || undefined,
          priceOverride: priceOverride.trim() ? Number(priceOverride) : undefined,
          maintenanceNotes: isMaintenance ? (maintenanceNotes.trim() || undefined) : undefined,
          roomType: roomTypes.find((rt) => rt.id === roomTypeId) || MOCK_ROOMS[idx].roomType,
        }
        toast.success('Chambre modifiée (mode hors ligne)')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(err.message || 'Une erreur est survenue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-[oklch(0.22_0.065_160)]" />
            Modifier la chambre
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de la chambre {room.number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="edit-room-number">
              Numéro de chambre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-room-number"
              placeholder="Ex: 401"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoFocus
            />
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <Label htmlFor="edit-room-floor">Étage</Label>
            <Input
              id="edit-room-floor"
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
            <Label htmlFor="edit-room-name">Nom (optionnel)</Label>
            <Input
              id="edit-room-name"
              placeholder="Ex: Suite Présidentielle"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Price Override (optional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-price-override">Prix personnalisé (optionnel)</Label>
            <Input
              id="edit-price-override"
              type="number"
              min="0"
              placeholder="Laisser vide = prix du type de chambre"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
            />
            {priceOverride && (
              <p className="text-xs text-muted-foreground">
                {formatFCFA(Number(priceOverride))} / nuit
              </p>
            )}
          </div>

          {/* Maintenance Notes — shown only when status is maintenance */}
          {isMaintenance && (
            <div className="space-y-2">
              <Label htmlFor="edit-maintenance-notes">Notes de maintenance</Label>
              <Textarea
                id="edit-maintenance-notes"
                placeholder="Décrivez le problème ou les travaux en cours..."
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

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
