import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ProjectStatus } from '@/api/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { projectStatusLabels } from '@/lib/constants'

interface ProjectsFiltersProps {
  search: string
  clientFilter: string
  statusFilter: string
  clients: string[]
  statuses: ProjectStatus[]
  onSearchChange: (next: string) => void
  onClientFilterChange: (next: string) => void
  onStatusFilterChange: (next: string) => void
}

export function ProjectsFilters({
  search,
  clientFilter,
  statusFilter,
  clients,
  statuses,
  onSearchChange,
  onClientFilterChange,
  onStatusFilterChange,
}: ProjectsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-56 pl-8"
        />
      </div>

      <Select value={clientFilter} onValueChange={onClientFilterChange}>
        <SelectTrigger className="w-44"><SelectValue placeholder="All clients" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all-clients">All clients</SelectItem>
          {clients.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all-statuses">All statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>{projectStatusLabels[status]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
