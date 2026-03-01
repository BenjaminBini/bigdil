import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string | number
  /**
   * Delta as a percentage (positive = up, negative = down).
   * When provided, an arrow icon and formatted percentage are rendered.
   */
  delta?: number
  /** Optional description shown below the value */
  description?: string
  className?: string
}

function formatValue(value: string | number): string {
  if (typeof value === 'string') return value
  return value.toLocaleString('fr-FR')
}

/**
 * A compact KPI card displaying a label, a primary value, and an optional
 * delta indicator (up/down arrow + percentage).
 */
export function KpiCard({
  label,
  value,
  delta,
  description,
  className,
}: KpiCardProps) {
  const hasDelta = delta !== undefined && delta !== null
  const isPositive = hasDelta && delta > 0
  const isNeutral = hasDelta && delta === 0

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-xs',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-1.5 flex items-end gap-2">
        <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
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
