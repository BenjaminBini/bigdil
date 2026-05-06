import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageTitleProps {
  children: ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn('text-2xl font-bold tracking-tight text-gray-900', className)}>{children}</h1>
  )
}

export function SectionTitle({ children, className, spacing }: PageTitleProps & { spacing?: 'sm' }) {
  return (
    <h2 className={cn('text-sm font-semibold text-gray-700', spacing === 'sm' && 'mb-2', className)}>{children}</h2>
  )
}
