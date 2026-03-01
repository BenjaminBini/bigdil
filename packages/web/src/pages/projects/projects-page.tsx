import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import { projectStatusColors, projectStatusLabels } from '@/lib/constants'

const ALL_CLIENTS = 'all-clients'
const ALL_STATUSES = 'all-statuses'

function ActivePeriod({ startDate, endDate }: { startDate: string | null; endDate: string | null }) {
  if (!startDate && !endDate) return <span className="text-gray-400">—</span>
  return (
    <span className="text-gray-700 text-sm">
      {formatDate(startDate)} – {formatDate(endDate)}
    </span>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState(ALL_CLIENTS)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !projects) return <div className="p-6">Error loading projects</div>

  const uniqueClients = [...new Set(projects.map((p) => p.clientName).filter(Boolean) as string[])]
  const uniqueStatuses = [...new Set(projects.map((p) => p.status))]

  const filtered = projects.filter((row) => {
    if (
      search &&
      !row.name.toLowerCase().includes(search.toLowerCase()) &&
      !(row.clientName ?? '').toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (clientFilter !== ALL_CLIENTS && row.clientName !== clientFilter) return false
    if (statusFilter !== ALL_STATUSES && row.status !== statusFilter) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>
          <Plus />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-56"
          />
        </div>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CLIENTS}>All clients</SelectItem>
            {uniqueClients.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            {uniqueStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {projectStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Client
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Project
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Contract Value
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Active Period
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/projects/${row.id}`)}
                >
                  <TableCell className="text-gray-500 text-sm py-3.5">
                    {row.clientName ?? <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 py-3.5">
                    {row.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={projectStatusColors[row.status]}>
                      {projectStatusLabels[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {formatCurrency(row.contractValue)}
                  </TableCell>
                  <TableCell>
                    <ActivePeriod startDate={row.startDate} endDate={row.endDate} />
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
