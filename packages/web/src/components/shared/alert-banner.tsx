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
  /** 'compact' uses smaller padding (px-4 py-3 text-sm) */
  size?: 'default' | 'compact'
}

const VARIANT_CLASSES: Record<AlertBannerVariant, string> = {
  info: 'border-l-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-l-blue-500',
  warning: 'border-l-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-l-amber-500',
  success: 'border-l-green-400 bg-green-50 dark:bg-green-950/30 dark:border-l-green-500',
}

const VARIANT_TITLE: Record<AlertBannerVariant, string> = {
  info: 'text-blue-800 dark:text-blue-300',
  warning: 'text-amber-800 dark:text-amber-300',
  success: 'text-green-800 dark:text-green-300',
}

const VARIANT_DESC: Record<AlertBannerVariant, string> = {
  info: 'text-blue-700 dark:text-blue-400',
  warning: 'text-amber-700 dark:text-amber-400',
  success: 'text-green-700 dark:text-green-400',
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
  size = 'default',
}: AlertBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 border-l-4',
        size === 'compact' ? 'px-4 py-3 text-sm' : 'p-4',
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
