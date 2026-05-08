import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface QuoteThProps {
  children: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
  colSpan?: number
  rowSpan?: number
  borderLeft?: boolean
  borderRight?: boolean
}

const QUOTE_TH_BASE = 'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'

export function QuoteTh({ children, align = 'right', className, borderLeft, borderRight, ...props }: QuoteThProps) {
  return (
    <th
      className={cn(
        QUOTE_TH_BASE,
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        borderLeft && 'border-l border-border',
        borderRight && 'border-r border-border',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

const QUOTE_GROUP_TH_BASE = 'py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest'

const groupColors = {
  blue: 'bg-sky-50/50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400',
  orange: 'bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  muted: 'bg-muted text-muted-foreground',
} as const

type GroupBorder = 'left' | 'right' | 'both'

export function QuoteGroupTh({ children, className, color, bordered, ...props }: QuoteThProps & { color?: 'blue' | 'orange' | 'muted'; bordered?: GroupBorder }) {
  return (
    <th
      className={cn(
        QUOTE_GROUP_TH_BASE,
        color && groupColors[color],
        (bordered === 'left' || bordered === 'both') && 'border-l border-border',
        (bordered === 'right' || bordered === 'both') && 'border-r border-border',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface QuoteTdProps {
  children: ReactNode
  className?: string
  bold?: boolean
}

const QUOTE_TD_BASE = 'px-3 py-2 text-right tabular-nums'

/** Standard quote grid data cell */
export function QuoteTd({ children, className, bold }: QuoteTdProps) {
  return (
    <td className={cn(QUOTE_TD_BASE, bold && 'font-medium', className)}>
      {children}
    </td>
  )
}
