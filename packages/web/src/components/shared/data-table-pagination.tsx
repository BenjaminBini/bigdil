import type { Table as TanstackTable } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>
  pageSize: number
  pageSizeOptions: readonly number[]
  from: number
  to: number
  total: number
  pageCount: number
  currentPage: number
  onPageSizeChange: (size: number) => void
}

export function DataTablePagination<TData>({
  table,
  pageSize,
  pageSizeOptions,
  from,
  to,
  total,
  pageCount,
  currentPage,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger size="sm" className="h-7 w-16"><SelectValue /></SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span>{total === 0 ? '0 results' : `${from}–${to} of ${total}`}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="text-xs">Page {pageCount === 0 ? 0 : currentPage + 1} / {pageCount}</span>
      </div>
    </div>
  )
}
