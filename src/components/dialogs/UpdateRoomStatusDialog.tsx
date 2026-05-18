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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  type Room,
  type RoomStatus,
  ROOM_STATUS_LABELS,
} from '@/types'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Wrench,
  Ban,
  RefreshCw,
  Loader2,
  BedDouble,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface UpdateRoomStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onSuccess: () => void
}

// ── Status Configuration ────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: RoomStatus
  label: string
  icon: React.ElementType
  colorClass: string
  borderClass: string
  bgClass: string
}[] = [
  {
    value: 'available',
    label: 'Libre',
    icon: CheckCircle2,
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/40',
  },
  {
    value: 'occupied',
    label: 'Occupée',
    icon: XCircle,
    colorClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-500',
    bgClass: 'bg-red-100 dark:bg-red-950/40',
  },
  {
    value: 'cleaning',
    label: 'Nettoyage',
    icon: Sparkles,
    colorClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-100 dark:bg-amber-950/40',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    colorClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800/40',
  },
  {
    value: 'blocked',
    label: 'Bloquée',
    icon: Ban,
    colorClass: 'text-gray-600 dark:text-gray-400',
    borderClass: 'border-gray-400',
    bgClass: 'bg-gray-100 dark:bg-gray-800/40',
  },
]

// ── Component ───────────────────────────────────────────────────────────────

export function UpdateRoomStatusDialog({
  open,
  onOpenChange,
  room,
  onSuccess,
}: UpdateRoomStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | ''>('')
  const [maintenanceNotes, setMaintenanceNotes] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open && room) {
      setSelectedStatus('')
      setMaintenanceNotes(room.maintenanceNotes ?? '')
    }
  }, [open, room])

  const handleSubmit = async () => {
    if (!room || !selectedStatus) return

    setIsSubmitting(true)
    try {
      const body: Record<string, any> = {
        status: selectedStatus,
      }

      if (selectedStatus === 'maintenance' && maintenanceNotes.trim()) {
        body.maintenanceNotes = maintenanceNotes.trim()
      } else if (selectedStatus !== 'maintenance') {
        body.maintenanceNotes = null
      }

      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut')
      }

      const statusLabel = ROOM_STATUS_LABELS[selectedStatus]
      toast.success(`Chambre ${room.number} → ${statusLabel}`)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!room) return null

  const currentStatusConfig = STATUS_OPTIONS.find((s) => s.value === room.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="size-5 text-[oklch(0.22_0.065_160)]" />
            Changer le statut
          </DialogTitle>
          <DialogDescription>
            Modifier le statut de la chambre {room.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Room Info */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BedDouble className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Chambre {room.number}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.roomType?.name ?? 'Non défini'} · {room.floor ?? '—'}
                  </p>
                </div>
              </div>
              {currentStatusConfig && (
                <Badge
                  variant="outline"
                  className={`${currentStatusConfig.bgClass} ${currentStatusConfig.colorClass} ${currentStatusConfig.borderClass} border text-xs font-semibold`}
                >
                  <currentStatusConfig.icon className="size-3 mr-1" />
                  {currentStatusConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label>Nouveau statut</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatus === option.value
                const isCurrent = room.status === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isCurrent}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all ${
                      isSelected
                        ? `${option.borderClass} ${option.bgClass} ${option.colorClass}`
                        : isCurrent
                          ? 'border-muted bg-muted/20 text-muted-foreground cursor-not-allowed'
                          : 'border-transparent bg-background hover:bg-accent hover:border-muted'
                    }`}
                    onClick={() => setSelectedStatus(option.value)}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-semibold">{option.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-muted-foreground">
                        Actuel
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Maintenance Notes */}
          {selectedStatus === 'maintenance' && (
            <div className="space-y-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3">
              <Label htmlFor="maintenance-notes" className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Wrench className="size-3.5" />
                Notes de maintenance
              </Label>
              <Textarea
                id="maintenance-notes"
                placeholder="Décrivez le problème ou les travaux en cours..."
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                rows={3}
                className="border-amber-200 dark:border-amber-800 bg-white dark:bg-background"
              />
            </div>
          )}
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
            disabled={isSubmitting || !selectedStatus || selectedStatus === room.status}
            className="bg-[oklch(0.22_0.065_160)] hover:bg-[oklch(0.18_0.065_160)] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <RefreshCw className="size-4 mr-1.5" />
                Appliquer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
