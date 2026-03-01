import { useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type { ColumnDef }

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  /**
   * When provided, a search filter input is shown and filters against the
   * given column id (must be a string-valued column).
   */
  searchColumn?: string
  searchPlaceholder?: string
  /** Additional content rendered to the right of the search field */
  toolbar?: React.ReactNode
  className?: string
}

/**
 * A generic, reusable data table with sorting, global/column search, and
 * pagination. Built on @tanstack/react-table + shadcn Table primitives.
 */
export function DataTable<TData>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = 'Search…',
  toolbar,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [pageIndex, setPageIndex] = useState(0)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchColumn ? undefined : globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize as PageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  })

  // Derived pagination state
  const { pageIndex: currentPage } = table.getState().pagination
  const pageCount = table.getPageCount()
  const from = currentPage * pageSize + 1
  const to = Math.min((currentPage + 1) * pageSize, table.getFilteredRowModel().rows.length)
  const total = table.getFilteredRowModel().rows.length

  // Search input value
  const searchValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
    : globalFilter

  const onSearchChange = (value: string) => {
    if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value)
    } else {
      setGlobalFilter(value)
    }
    setPageIndex(0)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={cn(
                            'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                            canSort && 'cursor-pointer select-none hover:text-foreground transition-colors',
                            !canSort && 'cursor-default',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="size-3.5 shrink-0">
                              {sorted === 'asc' && <ArrowUp className="size-3.5" />}
                              {sorted === 'desc' && <ArrowDown className="size-3.5" />}
                              {!sorted && <ArrowUpDown className="size-3.5 opacity-40" />}
                            </span>
                          )}
                        </button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v) as PageSize)
              setPageIndex(0)
            }}
          >
            <SelectTrigger size="sm" className="w-16 h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {total === 0 ? '0 results' : `${from}–${to} of ${total}`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <span className="text-xs">
            Page {pageCount === 0 ? 0 : currentPage + 1} / {pageCount}
          </span>
        </div>
      </div>
    </div>
  )
}
