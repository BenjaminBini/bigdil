import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Building2, ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconBox } from '@/components/shared/icon-box'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjects, useReferenceData } from '@/api/hooks'
import type { ProjectListItem } from '@/api/types'
import { ClientOverviewCard } from './components/client-overview-card'
import { ClientProjectsTable } from './components/client-projects-table'
import type { ClientProjectSortKey as SortKey, SortDir } from './components/client-project-table-utils'

interface ProjectRow {
  project: ProjectListItem
  contractValue: number
  marginForecast: number | null
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects()

  if (refLoading || projectsLoading) return <div className="p-6">Loading...</div>
  if (refError || projectsError || !refData || !projects) return <div className="p-6">Error loading data</div>

  const client = refData.clients.find((entry) => entry.id === id)
  if (!client) return <NotFound onBack={() => navigate('/clients')} />

  const projectRows: ProjectRow[] = projects
    .filter((project) => project.clientId === client.id)
    .map((project) => ({ project, contractValue: project.contractValue, marginForecast: null }))

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDir('asc')
  }

  const sortedProjects = [...projectRows].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'name':
        cmp = a.project.name.localeCompare(b.project.name)
        break
      case 'status':
        cmp = a.project.status.localeCompare(b.project.status)
        break
      case 'contractValue':
        cmp = a.contractValue - b.contractValue
        break
      case 'marginForecast':
        cmp = (a.marginForecast ?? 0) - (b.marginForecast ?? 0)
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
        <ChevronLeft className="size-4" /> Clients
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IconBox icon={Building2} size="md" variant="muted" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{client.name}</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {projectRows.length} project{projectRows.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil />
          Edit
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <ClientOverviewCard client={client} />
        </TabsContent>
        <TabsContent value="projects" className="mt-4">
          <ClientProjectsTable rows={sortedProjects} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <p className="text-gray-500">Client not found.</p>
      <div className="mt-4">
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft />
        Back to Clients
      </Button>
      </div>
    </div>
  )
}
