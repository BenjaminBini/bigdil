import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TextStrongProps {
  children: ReactNode
  className?: string
  /** Render at small text size */
  size?: 'sm'
  /** Apply a muted color variant */
  color?: 'default' | 'muted'
}

/** Inline bold span — font-medium */
export function TextStrong({ children, className, size, color }: TextStrongProps) {
  return (
    <span className={cn('font-medium', size === 'sm' && 'text-sm', color === 'muted' && 'text-gray-700', className)}>
      {children}
    </span>
  )
}
