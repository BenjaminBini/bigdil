import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps {
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  toolbar?: ReactNode
}

export function DataTableToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  toolbar,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 pl-8 text-sm"
        />
      </div>
      {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
    </div>
  )
}
