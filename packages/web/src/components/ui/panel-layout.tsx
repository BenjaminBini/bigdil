import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelLayoutProps {
  children: ReactNode
  className?: string
}

export function PanelLayout({ children, className }: PanelLayoutProps) {
  return <div className={cn('flex h-full flex-col', className)}>{children}</div>
}

interface ScrollPaneProps {
  children: ReactNode
  className?: string
}

export function ScrollPane({ children, className }: ScrollPaneProps) {
  return <div className={cn('relative flex-1 overflow-auto', className)}>{children}</div>
}
