import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatusItemProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  className?: string
}

/**
 * An icon + title + description row, typically used inside a divide-y container
 * for checklists and confirmation lists.
 */
export function StatusItem({ icon, title, description, className }: StatusItemProps) {
  return (
    <div className={cn('flex items-start gap-3 p-4', className)}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  )
}
