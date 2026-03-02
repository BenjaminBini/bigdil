import { TableHead } from '@/components/ui/table'

interface HeadCellProps {
  label: string
  className?: string
}

export function HeadCell({ label, className }: HeadCellProps) {
  return (
    <TableHead className={['text-xs font-semibold uppercase tracking-wide text-gray-500', className].join(' ').trim()}>
      {label}
    </TableHead>
  )
}
