import { SearchInput } from '@/components/shared/search-input'
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
      <div className="w-56">
        <SearchInput
          placeholder="Search projects..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="w-44">
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-clients">All clients</SelectItem>
            {clients.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-44">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">All statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>{projectStatusLabels[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
