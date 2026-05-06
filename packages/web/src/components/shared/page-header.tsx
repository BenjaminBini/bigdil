import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const headerVariants = cva('flex flex-wrap items-start justify-between gap-4', {
  variants: {
    variant: {
      default: 'border-b bg-background px-6 py-5',
      section: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const titleVariants = cva('leading-none font-semibold tracking-tight text-foreground', {
  variants: {
    variant: {
      default: 'text-xl',
      section: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface PageHeaderProps extends VariantProps<typeof headerVariants> {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  variant,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(headerVariants({ variant }), className)}>
      <div className="min-w-0">
        <h1 className={titleVariants({ variant })}>
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
