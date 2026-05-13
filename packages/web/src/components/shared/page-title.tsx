import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageTitleProps {
  children: ReactNode
  className?: string
  /** Heading level — defaults to h1 (page-level). Tab/section headers use h2. */
  as?: 'h1' | 'h2'
}

export function PageTitle({ children, className, as = 'h1' }: PageTitleProps) {
  const Tag = as
  const sizeClass = as === 'h2' ? 'text-xl' : 'text-2xl'
  return (
    <Tag className={cn(sizeClass, 'font-bold tracking-tight text-foreground', className)}>
      {children}
    </Tag>
  )
}

export function SectionTitle({ children, className, spacing }: { children: ReactNode; className?: string; spacing?: 'sm' }) {
  return (
    <h2 className={cn('text-sm font-semibold text-foreground/80', spacing === 'sm' && 'mb-2', className)}>{children}</h2>
  )
}
