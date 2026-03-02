import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MetricStripItem {
  label: string
  value: ReactNode
}

export interface MetricStripProps {
  items: MetricStripItem[]
  className?: string
}

/**
 * A horizontal row of label:value pairs separated by vertical dividers.
 * Typically used as a footer/summary bar.
 */
export function MetricStrip({ items, className }: MetricStripProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm', className)}>
      {items.map((item, idx) => (
        <div key={item.label} className="contents">
          {idx > 0 && <div className="h-4 w-px bg-slate-200" />}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{item.label}:</span>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
