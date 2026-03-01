import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReferenceData, useProjects } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'

type SortKey = 'name' | 'activeProjects' | 'contractValue' | 'marginForecast' | 'lastActivity'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="size-3.5 ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ArrowUp className="size-3.5 ml-1" />
    : <ArrowDown className="size-3.5 ml-1" />
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects()

  if (refLoading || projectsLoading) return <div className="p-6">Loading...</div>
  if (refError || projectsError || !refData || !projects) return <div className="p-6">Error loading data</div>

  const { clients } = refData

  // Derive client-level aggregates from live project data
  const clientRows = clients.map((client) => {
    const clientProjects = projects.filter((p) => p.clientId === client.id)
    const contractValue = clientProjects.reduce((sum, p) => sum + p.contractValue, 0)
    const lastActivity = clientProjects
      .map((p) => p.startDate)
      .filter((d): d is string => d !== null)
      .sort()
      .at(-1) ?? null
    return {
      client,
      activeProjects: clientProjects.filter((p) => p.status === 'IN_PROGRESS').length,
      totalProjects: clientProjects.length,
      contractValue,
      marginForecast: null as number | null,
      lastActivity,
    }
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = clientRows
    .filter((r) =>
      r.client.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.client.name.localeCompare(b.client.name)
          break
        case 'activeProjects':
          cmp = a.activeProjects - b.activeProjects
          break
        case 'contractValue':
          cmp = a.contractValue - b.contractValue
          break
        case 'marginForecast':
          cmp = (a.marginForecast ?? 0) - (b.marginForecast ?? 0)
          break
        case 'lastActivity':
          cmp = (a.lastActivity ?? '').localeCompare(b.lastActivity ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your client portfolio</p>
        </div>
        <Button>
          <Plus />
          New Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead
                className="cursor-pointer select-none hover:text-gray-900"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center">
                  Name
                  <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-gray-900 text-right"
                onClick={() => handleSort('activeProjects')}
              >
                <span className="inline-flex items-center justify-end w-full">
                  Active Projects
                  <SortIcon col="activeProjects" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-gray-900 text-right"
                onClick={() => handleSort('contractValue')}
              >
                <span className="inline-flex items-center justify-end w-full">
                  Total Contract Value
                  <SortIcon col="contractValue" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-gray-900 text-right"
                onClick={() => handleSort('marginForecast')}
              >
                <span className="inline-flex items-center justify-end w-full">
                  Margin Forecast
                  <SortIcon col="marginForecast" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-gray-900"
                onClick={() => handleSort('lastActivity')}
              >
                <span className="inline-flex items-center">
                  Last Activity
                  <SortIcon col="lastActivity" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(({ client, activeProjects, totalProjects, contractValue, marginForecast, lastActivity }) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell className="font-medium text-gray-900 py-3.5">
                    {client.name}
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      {totalProjects} project{totalProjects !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-700">{activeProjects}</TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {formatCurrency(contractValue)}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {marginForecast != null ? formatCurrency(marginForecast) : '—'}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(lastActivity)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
