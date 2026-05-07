import { SearchInput } from '@/components/shared/search-input'
import { FlexRow } from '@/components/shared/layouts'
import { FilterWrapper } from '@/components/shared/filter-wrapper'
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
    <FlexRow wrap>
      <FilterWrapper>
        <SearchInput
          placeholder="Rechercher un projet..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </FilterWrapper>

      <FilterWrapper size="md">
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger><SelectValue placeholder="Tous les clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-clients">Tous les clients</SelectItem>
            {clients.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterWrapper>

      <FilterWrapper size="md">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">Tous les statuts</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>{projectStatusLabels[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterWrapper>
    </FlexRow>
  )
}
