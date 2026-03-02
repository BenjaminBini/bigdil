import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AlertBannerVariant = 'info' | 'warning' | 'success'

export interface AlertBannerProps {
  icon?: ReactNode
  title: string
  description?: string
  children?: ReactNode
  variant: AlertBannerVariant
  className?: string
}

const VARIANT_CLASSES: Record<AlertBannerVariant, string> = {
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-amber-200 bg-amber-50',
  success: 'border-green-200 bg-green-50',
}

const VARIANT_TITLE: Record<AlertBannerVariant, string> = {
  info: 'text-blue-800',
  warning: 'text-amber-800',
  success: 'text-green-800',
}

const VARIANT_DESC: Record<AlertBannerVariant, string> = {
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-green-700',
}

/**
 * Colored alert/info banner with icon, title, and optional description/children.
 */
export function AlertBanner({
  icon,
  title,
  description,
  children,
  variant,
  className,
}: AlertBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div>
        <p className={cn('text-sm font-medium', VARIANT_TITLE[variant])}>{title}</p>
        {description && (
          <p className={cn('mt-0.5 text-xs', VARIANT_DESC[variant])}>{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}
