'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MOCK_ROOMS } from '@/lib/mock-data'
import type { RoomStatus } from '@/types'
import { ROOM_STATUS_LABELS } from '@/types'

interface StatusStyle {
  bg: string
  text: string
  border: string
  dot: string
}

const STATUS_STYLES: Record<RoomStatus, StatusStyle> = {
  available: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  occupied: {
    bg: 'bg-red-100 dark:bg-red-950/50',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800/60',
    dot: 'bg-red-500',
  },
  cleaning: {
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  maintenance: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700/60',
    dot: 'bg-slate-400',
  },
  blocked: {
    bg: 'bg-gray-200 dark:bg-gray-800',
    text: 'text-gray-400 dark:text-gray-500',
    border: 'border-gray-300 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
}

const STATUS_ORDER: RoomStatus[] = [
  'available',
  'occupied',
  'cleaning',
  'maintenance',
  'blocked',
]

export function RoomStatusGrid() {
  const statusCounts = React.useMemo(() => {
    const counts: Record<RoomStatus, number> = {
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      blocked: 0,
    }
    MOCK_ROOMS.forEach((room) => {
      if (room.status in counts) {
        counts[room.status]++
      }
    })
    return counts
  }, [])

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Disponibilité en temps réel
        </CardTitle>
        <CardDescription>
          Cliquez sur une chambre pour voir les détails
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Room grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
          {MOCK_ROOMS.map((room) => {
            const style = STATUS_STYLES[room.status]
            return (
              <button
                key={room.id}
                className={`
                  rounded-md border p-2 text-center text-xs font-medium
                  transition-all duration-150 hover:scale-[1.02]
                  hover:shadow-sm active:scale-[0.98]
                  cursor-pointer
                  ${style.bg} ${style.text} ${style.border}
                `}
                title={`${ROOM_STATUS_LABELS[room.status]} — Chambre ${room.number}`}
              >
                <span className="block text-sm font-bold">{room.number}</span>
                <span className="mt-0.5 block text-[10px] opacity-70 hidden sm:block">
                  {ROOM_STATUS_LABELS[room.status]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="flex items-center gap-1.5"
            >
              <div
                className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`}
              />
              <span className="text-xs text-muted-foreground">
                {ROOM_STATUS_LABELS[status]}{' '}
                <span className="font-medium tabular-nums">
                  ({statusCounts[status]})
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
