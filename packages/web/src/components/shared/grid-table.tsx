import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GridTableProps {
  children: ReactNode
  className?: string
}

/** Compact border-collapse table for dense data grids */
export function GridTable({ children, className }: GridTableProps) {
  return (
    <table className={cn('min-w-max border-collapse text-xs', className)}>
      {children}
    </table>
  )
}

/** Sticky thead for scrollable grids */
export function StickyThead({ children }: { children: ReactNode }) {
  return <thead className="sticky top-0 z-10 bg-muted">{children}</thead>
}

/** Horizontal scroll wrapper for wide tables */
export function ScrollContainer({ children, className }: GridTableProps) {
  return <div className={cn('overflow-x-auto', className)}>{children}</div>
}
