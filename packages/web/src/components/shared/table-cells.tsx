import type { ReactNode } from 'react'
import { TableCell, TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface CellProps {
  children?: ReactNode
  colSpan?: number
  className?: string
}

/** Primary name/label cell — font-medium text-gray-900 */
export function TdPrimary({ children, colSpan, className, size, tabularNums }: CellProps & { size?: 'sm'; tabularNums?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 font-medium text-gray-900', size === 'sm' && 'text-sm', tabularNums && 'tabular-nums', className)}>
      {children}
    </TableCell>
  )
}

/** Secondary info cell — text-gray-700 */
export function TdSecondary({ children, colSpan, className, bold }: CellProps & { bold?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-gray-700', bold && 'font-medium', className)}>
      {children}
    </TableCell>
  )
}

/** Detail cell — text-gray-600 text-sm (dates, profile names, etc.) */
export function TdDetail({ children, colSpan, className, tabularNums, nowrap }: CellProps & { tabularNums?: boolean; nowrap?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-sm text-gray-600', tabularNums && 'tabular-nums', nowrap && 'whitespace-nowrap', className)}>
      {children}
    </TableCell>
  )
}

/** Right-aligned cell — text-right (no color opinion) */
export function TdRight({ children, colSpan, className, bold, nowrap, tabularNums, muted }: CellProps & { bold?: boolean; nowrap?: boolean; tabularNums?: boolean; muted?: boolean }) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right', bold && 'font-medium', nowrap && 'whitespace-nowrap', tabularNums && 'tabular-nums', muted && 'text-gray-500', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric data cell — text-right tabular-nums text-gray-700 */
export function TdNumeric({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums text-gray-700', className)}>
      {children}
    </TableCell>
  )
}

/** Numeric data cell in gray-600 — text-right tabular-nums text-gray-600 */
export function TdNumericLight({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums text-gray-600', className)}>
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

/** Numeric primary cell — text-right tabular-nums font-medium text-gray-900 */
export function TdNumericPrimary({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-right tabular-nums font-medium text-gray-900', className)}>
      {children}
    </TableCell>
  )
}

/** De-emphasized cell — text-xs text-gray-500 */
export function TdMuted({ children, colSpan, className }: CellProps) {
  return (
    <TableCell colSpan={colSpan} className={cn('py-3 text-xs text-gray-500', className)}>
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

/** Null/empty value display — gray em-dash */
export function NullCell() {
  return <span className="text-gray-400">&mdash;</span>
}

/** Null/empty value display — gray text (e.g. "Not set") */
export function NullText({ children = 'Not set' }: { children?: ReactNode }) {
  return <span className="text-gray-400">{children}</span>
}
