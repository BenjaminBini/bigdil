import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjects } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { ProjectsFilters } from './components/projects-filters'
import { ProjectsTable } from './components/projects-table'

const ALL_CLIENTS = 'all-clients'
const ALL_STATUSES = 'all-statuses'

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState(ALL_CLIENTS)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !projects) return <div className="p-6">Error loading projects</div>

  const uniqueClients = [...new Set(projects.map((project) => project.clientName).filter(Boolean) as string[])]
  const uniqueStatuses = [...new Set(projects.map((project) => project.status))]

  const filteredRows = projects.filter((row) => {
    if (
      search &&
      !row.name.toLowerCase().includes(search.toLowerCase()) &&
      !(row.clientName ?? '').toLowerCase().includes(search.toLowerCase())
    ) return false
    if (clientFilter !== ALL_CLIENTS && row.clientName !== clientFilter) return false
    if (statusFilter !== ALL_STATUSES && row.status !== statusFilter) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>
          <Plus />
          New Project
        </Button>
      </div>

      <ProjectsFilters
        search={search}
        clientFilter={clientFilter}
        statusFilter={statusFilter}
        clients={uniqueClients}
        statuses={uniqueStatuses}
        onSearchChange={setSearch}
        onClientFilterChange={setClientFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ProjectsTable rows={filteredRows} />
    </div>
  )
}
