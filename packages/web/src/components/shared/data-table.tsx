import { useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTableGrid } from './data-table-grid'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

export type { ColumnDef }

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  className?: string
}

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

  const { pageIndex: currentPage } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const from = currentPage * pageSize + 1
  const to = Math.min((currentPage + 1) * pageSize, total)

  const searchValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
    : globalFilter

  function onSearchChange(value: string) {
    if (searchColumn) table.getColumn(searchColumn)?.setFilterValue(value)
    else setGlobalFilter(value)
    setPageIndex(0)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <DataTableToolbar
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        toolbar={toolbar}
      />
      <DataTableGrid table={table} columns={columns} />
      <DataTablePagination
        table={table}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        from={from}
        to={to}
        total={total}
        pageCount={pageCount}
        currentPage={currentPage}
        onPageSizeChange={(size) => {
          setPageSize(size as PageSize)
          setPageIndex(0)
        }}
      />
    </div>
  )
}
