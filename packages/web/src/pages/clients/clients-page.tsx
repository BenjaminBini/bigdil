import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/shared/search-input'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { useProjects, useReferenceData } from '@/api/hooks'
import type { Client, ProjectListItem } from '@/api/types'
import { ClientsListTable } from './components/clients-list-table'
import {
  type ClientListRow,
  type ClientSortKey,
  type SortDir,
} from './components/clients-list-model'
import { NewClientDialog } from './components/new-client-dialog'

function buildClientRows(clients: Client[], projects: ProjectListItem[]): ClientListRow[] {
  return clients.map((client) => {
    const clientProjects = projects.filter((project) => project.clientId === client.id)
    const contractValue = clientProjects.reduce((sum, project) => sum + project.contractValue, 0)
    const lastActivity =
      clientProjects
        .map((project) => project.startDate)
        .filter((date): date is string => date !== null)
        .sort()
        .at(-1) ?? null

    return {
      client,
      activeProjects: clientProjects.filter((project) => project.isActive).length,
      totalProjects: clientProjects.length,
      contractValue,
      marginForecast: null,
      lastActivity,
    }
  })
}

function filterAndSortClientRows(
  rows: ClientListRow[],
  search: string,
  sortKey: ClientSortKey,
  sortDir: SortDir,
): ClientListRow[] {
  return rows
    .filter((row) => row.client.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'name':
          comparison = a.client.name.localeCompare(b.client.name)
          break
        case 'activeProjects':
          comparison = a.activeProjects - b.activeProjects
          break
        case 'contractValue':
          comparison = a.contractValue - b.contractValue
          break
        case 'marginForecast':
          comparison = (a.marginForecast ?? 0) - (b.marginForecast ?? 0)
          break
        case 'lastActivity':
          comparison = (a.lastActivity ?? '').localeCompare(b.lastActivity ?? '')
          break
      }

      return sortDir === 'asc' ? comparison : -comparison
    })
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<ClientSortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showNewClient, setShowNewClient] = useState(false)

  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects()

  if (refLoading || projectsLoading) return <LoadingState />
  if (refError || projectsError || !refData || !projects) {
    return <ErrorState />
  }

  const rows = buildClientRows(refData.clients, projects)
  const filteredRows = filterAndSortClientRows(rows, search, sortKey, sortDir)

  function handleSort(nextKey: ClientSortKey) {
    if (nextKey === sortKey) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDir('asc')
  }

  return (
    <>
      <PageHeader
        variant="section"
        title="Clients"
        subtitle="Gérez votre portefeuille clients"
        actions={
          <Button onClick={() => setShowNewClient(true)}>
            <Plus />
            Nouveau client
          </Button>
        }
      />
      <PageContainer size="lg">
      <SearchInput
        maxWidth="md"
        placeholder="Rechercher un client..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <ClientsListTable
        rows={filteredRows}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onOpenClient={(clientId) => navigate(`/clients/${clientId}`)}
      />

      <NewClientDialog open={showNewClient} onClose={() => setShowNewClient(false)} />
      </PageContainer>
    </>
  )
}
