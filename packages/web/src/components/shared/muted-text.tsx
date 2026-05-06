import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MutedTextProps {
  children: ReactNode
  className?: string
  /** 'tight' adds mt-0.5 for use below headings/labels */
  spacing?: 'tight'
}

export function MutedText({ children, className, spacing }: MutedTextProps) {
  return (
    <p className={cn('text-sm text-gray-500', spacing === 'tight' && 'mt-0.5', className)}>
      {children}
    </p>
  )
}
