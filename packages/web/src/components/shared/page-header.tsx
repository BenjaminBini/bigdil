import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Slot for action buttons rendered on the right side */
  actions?: React.ReactNode
  className?: string
}

/**
 * A standard page-level header with a title, optional subtitle, and an
 * actions slot for buttons/controls aligned to the right.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 border-b bg-background px-6 py-5',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
