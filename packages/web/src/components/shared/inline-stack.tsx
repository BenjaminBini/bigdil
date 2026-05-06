import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InlineStackProps {
  children: ReactNode
  className?: string
  gap?: 'xs' | 'sm'
  justify?: 'start' | 'end'
}

const gapMap = { xs: 'gap-1', sm: 'gap-1.5' } as const

/** Inline flex row — for badge + icon combos inside table cells */
export function InlineStack({ children, className, gap = 'sm', justify }: InlineStackProps) {
  return (
    <span className={cn('inline-flex items-center', gapMap[gap], justify === 'end' && 'justify-end', className)}>
      {children}
    </span>
  )
}
