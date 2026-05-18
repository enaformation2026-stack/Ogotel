'use client'

import * as React from 'react'
import { Pie, PieChart, Cell } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { MOCK_PAYMENT_BREAKDOWN } from '@/lib/mock-data'
import { PAYMENT_METHOD_LABELS, formatFCFA } from '@/types'
import type { PaymentMethod } from '@/types'

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  orange_money: '#FF6600',
  wave: '#1DC3E0',
  cash: '#22C55E',
  mtn_money: '#FFCC00',
  card: '#6366F1',
  moov_money: '#94A3B8',
  bank_transfer: '#94A3B8',
}

const chartConfig = {
  amount: {
    label: 'Montant',
  },
  orange_money: { label: PAYMENT_METHOD_LABELS.orange_money, color: '#FF6600' },
  wave: { label: PAYMENT_METHOD_LABELS.wave, color: '#1DC3E0' },
  cash: { label: PAYMENT_METHOD_LABELS.cash, color: '#22C55E' },
  mtn_money: { label: PAYMENT_METHOD_LABELS.mtn_money, color: '#FFCC00' },
  card: { label: PAYMENT_METHOD_LABELS.card, color: '#6366F1' },
  bank_transfer: { label: PAYMENT_METHOD_LABELS.bank_transfer, color: '#94A3B8' },
  moov_money: { label: PAYMENT_METHOD_LABELS.moov_money, color: '#94A3B8' },
} satisfies ChartConfig

export function PaymentMethodsChart() {
  const total = MOCK_PAYMENT_BREAKDOWN.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Méthodes de paiement
        </CardTitle>
        <CardDescription>
          Répartition du mois en cours
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="mx-auto h-[220px] w-full max-w-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const method = name as PaymentMethod
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[method]}
                        </span>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatFCFA(value as number)}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Pie
              data={MOCK_PAYMENT_BREAKDOWN}
              dataKey="amount"
              nameKey="method"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {MOCK_PAYMENT_BREAKDOWN.map((entry) => (
                <Cell
                  key={entry.method}
                  fill={PAYMENT_COLORS[entry.method]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Custom legend */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MOCK_PAYMENT_BREAKDOWN.map((entry) => (
            <div
              key={entry.method}
              className="flex items-center gap-2 rounded-md px-1 py-1"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: PAYMENT_COLORS[entry.method] }}
              />
              <div className="flex flex-1 items-center justify-between gap-1">
                <span className="truncate text-xs text-muted-foreground">
                  {PAYMENT_METHOD_LABELS[entry.method]}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-xs font-semibold tabular-nums">
                    {entry.percentage}%
                  </span>
                  <span className="hidden text-[10px] text-muted-foreground sm:inline">
                    {formatFCFA(entry.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
