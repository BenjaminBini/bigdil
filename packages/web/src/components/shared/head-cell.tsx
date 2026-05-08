import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface HeadCellProps {
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  className?: string
  /** compact: font-medium text-foreground/70 (for inline/detail tables) */
  variant?: 'default' | 'compact'
  /** Allow label to wrap to multiple lines */
  wrap?: boolean
}

export function HeadCell({ label, align, width, className, variant = 'default', wrap }: HeadCellProps) {
  return (
    <TableHead
      className={cn(
        variant === 'compact'
          ? 'h-9 font-medium text-foreground/70'
          : 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        wrap && 'whitespace-normal leading-tight',
        className,
      )}
      style={width ? { width } : undefined}
    >
      {label}
    </TableHead>
  )
}
