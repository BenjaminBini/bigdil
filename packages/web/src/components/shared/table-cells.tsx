import type { ReactNode } from 'react'
import { TableCell, TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface CellProps {
  children?: ReactNode
  colSpan?: number
  className?: string
}

/** Primary name/label cell — font-medium text-foreground */
export function TdPrimary({ children, colSpan, className, size, tabularNums }: CellProps & { size?: 'sm'; tabularNums?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 font-medium text-foreground', size === 'sm' && 'text-sm', tabularNums && 'tabular-nums', className)}>
      {children}
    </TableCell>
  )
}

/** Secondary info cell — text-foreground/80 */
export function TdSecondary({ children, colSpan, className, bold }: CellProps & { bold?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-foreground/80', bold && 'font-medium', className)}>
      {children}
    </TableCell>
  )
}

/** Detail cell — text-foreground/70 text-sm (dates, profile names, etc.) */
export function TdDetail({ children, colSpan, className, tabularNums, nowrap }: CellProps & { tabularNums?: boolean; nowrap?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-sm text-foreground/70', tabularNums && 'tabular-nums', nowrap && 'whitespace-nowrap', className)}>
      {children}
    </TableCell>
  )
}

/** Right-aligned cell — text-right (no color opinion) */
export function TdRight({ children, colSpan, className, bold, nowrap, tabularNums, muted }: CellProps & { bold?: boolean; nowrap?: boolean; tabularNums?: boolean; muted?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right', bold && 'font-medium', nowrap && 'whitespace-nowrap', tabularNums && 'tabular-nums', muted && 'text-muted-foreground', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric data cell — text-right tabular-nums text-foreground/80 */
export function TdNumeric({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums text-foreground/80', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric data cell lighter — text-right tabular-nums text-foreground/70 */
export function TdNumericLight({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums text-foreground/70', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric bold cell — text-right tabular-nums font-semibold */
export function TdNumericBold({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums font-semibold', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric primary cell — text-right tabular-nums font-medium text-foreground */
export function TdNumericPrimary({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums font-medium text-foreground', className)}>
      {children}
    </TableCell>
  )
}

/** De-emphasized cell — text-xs text-muted-foreground */
export function TdMuted({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-xs text-muted-foreground', className)}>
      {children}
    </TableCell>
  )
}

/** Right-aligned table header */
export function ThRight({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <TableHead className={cn('text-right', className)}>
      {children}
    </TableHead>
  )
}

/** Null/empty value display — muted em-dash */
export function NullCell() {
  return <span className="text-muted-foreground">&mdash;</span>
}

/** Null/empty value display — muted text (e.g. "Not set") */
export function NullText({ children = 'Not set' }: { children?: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>
}
