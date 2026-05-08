import { cn } from '@/lib/utils'

export interface NumberedListProps {
  items: string[]
  className?: string
}

/**
 * An ordered list with numbered circles before each item.
 */
export function NumberedList({ items, className }: NumberedListProps) {
  return (
    <ol className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border text-xs font-bold text-muted-foreground">
            {index + 1}
          </span>
          <span className="text-sm text-foreground/70">{item}</span>
        </li>
      ))}
    </ol>
  )
}
