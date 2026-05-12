import { useTranslation } from 'react-i18next'
import { SearchInput } from '@/components/shared/search-input'
import { FlexRow } from '@/components/shared/layouts'
import { FilterWrapper } from '@/components/shared/filter-wrapper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProjectLifecycle } from '@/lib/constants'

interface ProjectsFiltersProps {
  search: string
  clientFilter: string
  statusFilter: string
  clients: string[]
  statuses: ProjectLifecycle[]
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
  const { t } = useTranslation(['pages', 'statuses'])
  const lifecycleLabel = (status: ProjectLifecycle): string => {
    if (status === 'ACTIVE') return t('statuses:misc.ACTIVE')
    if (status === 'UPCOMING') return t('statuses:misc.UPCOMING')
    return t('statuses:misc.CLOSED')
  }
  return (
    <FlexRow wrap>
      <FilterWrapper>
        <SearchInput
          placeholder={`${t('pages:projects.filters.search')}…`}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </FilterWrapper>

      <FilterWrapper size="md">
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger><SelectValue placeholder={t('pages:projects.filters.allClients')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-clients">{t('pages:projects.filters.allClients')}</SelectItem>
            {clients.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterWrapper>

      <FilterWrapper size="md">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger><SelectValue placeholder={t('pages:projects.filters.allStatuses')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">{t('pages:projects.filters.allStatuses')}</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>{lifecycleLabel(status)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterWrapper>
    </FlexRow>
  )
}
