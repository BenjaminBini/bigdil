import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type InputProps = ComponentProps<'input'>

/** Spreadsheet-style numeric input for table cells — invisible at rest, underline on focus. */
export function CompactInput({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        // layout
        'w-16 min-w-0 text-right tabular-nums',
        // hide native spinners
        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        'bg-transparent outline-none border-0 px-0 py-0.5 text-xs text-foreground',
        className,
      )}
    />
  )
}
