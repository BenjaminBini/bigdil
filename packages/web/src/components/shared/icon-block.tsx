import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface IconBlockProps {
  icon: ReactNode
  label: string
  value: ReactNode
  className?: string
}

/**
 * An icon + label + value block. The icon sits inside a rounded background.
 */
export function IconBlock({ icon, label, value, className }: IconBlockProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {value}
      </div>
    </div>
  )
}
