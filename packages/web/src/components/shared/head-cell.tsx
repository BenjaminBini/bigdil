import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface HeadCellProps {
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  className?: string
  /** compact: font-medium text-gray-600 (for inline/detail tables) */
  variant?: 'default' | 'compact'
}

export function HeadCell({ label, align, width, className, variant = 'default' }: HeadCellProps) {
  return (
    <TableHead
      className={cn(
        variant === 'compact'
          ? 'h-9 font-medium text-gray-600'
          : 'text-xs font-semibold uppercase tracking-wide text-gray-500',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      style={width ? { width } : undefined}
    >
      {label}
    </TableHead>
  )
}
