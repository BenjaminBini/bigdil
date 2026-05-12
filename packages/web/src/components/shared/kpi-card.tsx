import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type KpiCardVariant = 'default' | 'highlight' | 'warning' | 'dim' | 'inline'

export interface KpiCardProps {
  label: string
  value: string | number
  /**
   * Delta as a percentage (positive = up, negative = down).
   * When provided, an arrow icon and formatted percentage are rendered.
   */
  delta?: number
  /** Optional description / sub-value shown below the value */
  description?: string
  /** Visual variant: highlight=green, warning=amber, dim=opacity */
  variant?: KpiCardVariant
  /** Optional icon rendered in the header area (top-right) */
  icon?: ReactNode
  /** Custom class applied to the value text */
  valueClassName?: string
  className?: string
}

const VARIANT_CONTAINER: Record<KpiCardVariant, string> = {
  default: 'border p-5 border-border bg-card',
  highlight: 'border p-5 border-green-200 bg-green-50',
  warning: 'border p-5 border-amber-200 bg-amber-50',
  dim: 'border p-5 border-border bg-card opacity-60',
  inline: '',
}

const VARIANT_VALUE: Record<KpiCardVariant, string> = {
  default: 'text-foreground',
  highlight: 'text-green-700',
  warning: 'text-amber-700',
  dim: 'text-muted-foreground',
  inline: 'text-foreground',
}

function formatValue(value: string | number): string {
  if (typeof value === 'string') return value
  return value.toLocaleString('fr-FR')
}

/**
 * A compact KPI card displaying a label, a primary value, and optional
 * delta indicator, icon, and description. Supports visual variants.
 */
export function KpiCard({
  label,
  value,
  delta,
  description,
  variant = 'default',
  icon,
  valueClassName,
  className,
}: KpiCardProps) {
  const hasDelta = delta !== undefined && delta !== null
  const isPositive = hasDelta && delta > 0
  const isNeutral = hasDelta && delta === 0

  return (
    <div
      className={cn(
        VARIANT_CONTAINER[variant],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>

      <div className="mt-1.5 flex items-end gap-2">
        <span
          className={cn(
            'text-2xl font-semibold leading-none tracking-tight tabular-nums',
            VARIANT_VALUE[variant],
            valueClassName,
          )}
        >
          {formatValue(value)}
        </span>

        {hasDelta && !isNeutral && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-green-600' : 'text-red-500',
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}

        {hasDelta && isNeutral && (
          <span className="mb-0.5 text-xs font-medium text-muted-foreground">
            0%
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
