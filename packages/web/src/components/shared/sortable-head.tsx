import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'

export type SortDir = 'asc' | 'desc'

interface SortableHeadProps<K extends string> {
  label: string
  col: K
  sortKey: K
  sortDir: SortDir
  onSort: (key: K) => void
  align?: 'left' | 'right'
}

export function SortableHead<K extends string>({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  align = 'left',
}: SortableHeadProps<K>) {
  const icon =
    col !== sortKey ? (
      <ArrowUpDown className="ml-1 size-3.5 opacity-40" />
    ) : sortDir === 'asc' ? (
      <ArrowUp className="ml-1 size-3.5" />
    ) : (
      <ArrowDown className="ml-1 size-3.5" />
    )

  return (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground ${align === 'right' ? 'text-right' : ''}`}
      onClick={() => onSort(col)}
    >
      <span className={`inline-flex items-center ${align === 'right' ? 'w-full justify-end' : ''}`}>
        {label}
        {icon}
      </span>
    </TableHead>
  )
}
