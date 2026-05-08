import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardTitleBarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function CardTitleBar({ title, subtitle, actions }: CardTitleBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-5 py-4">
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

interface CardFooterBarProps {
  children: ReactNode
  className?: string
  /** 'end' right-aligns content */
  align?: 'start' | 'end'
}

export function CardFooterBar({ children, className, align }: CardFooterBarProps) {
  return (
    <div className={cn('flex items-center gap-4 border-t bg-muted/50 px-5 py-3 text-xs text-muted-foreground', align === 'end' && 'justify-end', className)}>
      {children}
    </div>
  )
}
