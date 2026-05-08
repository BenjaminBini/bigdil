import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 px-6 py-24', className)}>
      {Icon && (
        <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-400">
          <Icon className="size-8" />
        </div>
      )}
      <div className="max-w-sm text-center">
        <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
