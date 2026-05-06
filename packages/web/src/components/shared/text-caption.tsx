import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TextCaptionProps {
  children: ReactNode
  className?: string
  /** Center-align (e.g. login footer) */
  center?: boolean
}

/** Tiny muted caption — text-xs text-gray-400 */
export function TextCaption({ children, className, center }: TextCaptionProps) {
  return (
    <p className={cn('text-xs text-gray-400', center && 'text-center', className)}>
      {children}
    </p>
  )
}
