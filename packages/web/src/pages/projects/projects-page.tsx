import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjects } from '@/api/hooks'
import type { ProjectListItem } from '@/api/types'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { ProjectsFilters } from './components/projects-filters'
import { ProjectsTable } from './components/projects-table'
import { NewProjectDialog } from './components/new-project-dialog'

const ALL_CLIENTS = 'all-clients'
const ALL_STATUSES = 'all-statuses'

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState(ALL_CLIENTS)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [showNewProject, setShowNewProject] = useState(false)
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <LoadingState />
  if (error || !projects) return <ErrorState message="Erreur lors du chargement des projets" />

  const uniqueClients = [...new Set(projects.map((project) => project.clientName).filter(Boolean) as string[])]
  // Lifecycle filter: derive a coarse label per project so the user can scope
  // the list to active / upcoming / closed without surfacing the old enum.
  function projectLifecycle(p: ProjectListItem): 'ACTIVE' | 'UPCOMING' | 'CLOSED' {
    if (p.closedAt) return 'CLOSED'
    if (p.isActive) return 'ACTIVE'
    const today = new Date().toISOString().slice(0, 10)
    if (p.startDate && today < p.startDate) return 'UPCOMING'
    return 'CLOSED'
  }
  const uniqueStatuses = [...new Set(projects.map(projectLifecycle))]

  const filteredRows = projects.filter((row) => {
    if (
      search &&
      !row.name.toLowerCase().includes(search.toLowerCase()) &&
      !(row.clientName ?? '').toLowerCase().includes(search.toLowerCase())
    ) return false
    if (clientFilter !== ALL_CLIENTS && row.clientName !== clientFilter) return false
    if (statusFilter !== ALL_STATUSES && projectLifecycle(row) !== statusFilter) return false
    return true
  })

  return (
    <>
      <PageHeader
        variant="section"
        title="Projets"
        subtitle={`${projects.length} projet${projects.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setShowNewProject(true)}>
            <Plus />
            Nouveau projet
          </Button>
        }
      />
      <PageContainer>
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

      <NewProjectDialog open={showNewProject} onClose={() => setShowNewProject(false)} />
      </PageContainer>
    </>
  )
}
