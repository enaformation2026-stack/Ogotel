'use client'

import { Badge } from '@/components/ui/badge'
import { Star, Zap } from 'lucide-react'
import type { SubscriptionPlan } from '@/types'

const PLAN_CONFIG: Record<
  SubscriptionPlan,
  { label: string; icon: typeof Star; className: string }
> = {
  trial: {
    label: 'Essai',
    icon: Zap,
    className:
      'border-amber-600/40 bg-amber-600/15 text-amber-300 hover:bg-amber-600/20',
  },
  starter: {
    label: 'Starter',
    icon: Star,
    className:
      'border-sky-600/40 bg-sky-600/15 text-sky-300 hover:bg-sky-600/20',
  },
  pro: {
    label: 'Pro',
    icon: Star,
    className:
      'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Star,
    className:
      'border-violet-500/40 bg-violet-500/15 text-violet-300 hover:bg-violet-500/20',
  },
}

interface SubscriptionBadgeProps {
  plan: SubscriptionPlan
  className?: string
}

export function SubscriptionBadge({ plan, className }: SubscriptionBadgeProps) {
  const config = PLAN_CONFIG[plan]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] font-semibold uppercase tracking-wider ${config.className} ${className ?? ''}`}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
