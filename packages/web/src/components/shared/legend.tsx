import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface LegendItem {
  icon?: ReactNode
  /** Colored swatch shown when no icon. Uses Tailwind bg class like "bg-amber-100". */
  swatch?: string
  /** Border color for the swatch. Uses Tailwind border class like "border-amber-200". */
  swatchBorder?: string
  label: string
}

export interface LegendProps {
  items: LegendItem[]
  className?: string
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.icon ? (
            <span className="inline-flex size-3 items-center justify-center rounded-sm border border-border bg-muted">
              {item.icon}
            </span>
          ) : item.swatch ? (
            <span className={cn('inline-block size-3 rounded-sm border', item.swatch, item.swatchBorder)} />
          ) : null}
          {item.label}
        </span>
      ))}
    </div>
  )
}
