import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProjects, useReferenceData } from '@/api/hooks'
import { ClientsListTable } from './components/clients-list-table'
import {
  buildClientRows,
  type ClientSortKey,
  filterAndSortClientRows,
  type SortDir,
} from './components/clients-list-model'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<ClientSortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects()

  if (refLoading || projectsLoading) return <div className="p-6">Loading...</div>
  if (refError || projectsError || !refData || !projects) {
    return <div className="p-6">Error loading data</div>
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
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your client portfolio</p>
        </div>
        <Button>
          <Plus />
          New Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      <ClientsListTable
        rows={filteredRows}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onOpenClient={(clientId) => navigate(`/clients/${clientId}`)}
      />
    </div>
  )
}
