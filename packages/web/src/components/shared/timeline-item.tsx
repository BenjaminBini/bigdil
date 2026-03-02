import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TimelineItemProps {
  icon?: ReactNode
  label: ReactNode
  sub?: ReactNode
  className?: string
}

/**
 * A single row in a timeline / activity list: icon + label + optional sub-text.
 */
export function TimelineItem({ icon, label, sub, className }: TimelineItemProps) {
  return (
    <div
      className={cn(
        'flex gap-3 border-b border-gray-100 py-3 last:border-0',
        className,
      )}
    >
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}
