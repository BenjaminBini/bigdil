import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DetailRowProps {
  label: string
  value: ReactNode
  className?: string
}

/**
 * A horizontal label–value row typically used inside cards.
 * Renders a left-aligned label and a right-aligned value.
 */
export function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-0',
        className,
      )}
    >
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
