import { TableCell, TableRow } from '@/components/ui/table'

interface EmptyRowProps {
  colSpan: number
  message?: string
}

/** Empty state row for tables — centered gray text with generous padding */
export function EmptyRow({ colSpan, message = 'No data found' }: EmptyRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-gray-400">
        {message}
      </TableCell>
    </TableRow>
  )
}
