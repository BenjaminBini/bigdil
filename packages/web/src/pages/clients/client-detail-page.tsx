import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Pencil, Mail, MapPin, User, Building2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useReferenceData, useProjects } from '@/api/hooks'
import { projectStatusColors } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ProjectListItem, ProjectStatus } from '@/api/types'
import { SortIcon, STATUS_LABELS, type ClientProjectSortKey as SortKey, type SortDir } from './components/client-project-table-utils'

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

  const client = refData.clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-500">Client not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/clients')}>
          <ChevronLeft />
          Back to Clients
        </Button>
      </div>
    )
  }

  const projectRows: ProjectRow[] = projects.filter((p) => p.clientId === client.id).map((p) => ({
    project: p,
    contractValue: p.contractValue,
    marginForecast: null,
  }))

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate('/clients')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft className="size-4" />
        Clients
      </button>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-11 rounded-xl bg-gray-100 text-gray-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{projectRows.length} project{projectRows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil />
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-800">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex items-center justify-center size-8 rounded-md bg-gray-50 text-gray-500 shrink-0">
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Contact Name</p>
                    <p className="text-sm font-medium text-gray-900">{client.contactName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex items-center justify-center size-8 rounded-md bg-gray-50 text-gray-500 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Email</p>
                    <a
                      href={`mailto:${client.contactEmail}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {client.contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="mt-0.5 flex items-center justify-center size-8 rounded-md bg-gray-50 text-gray-500 shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Address</p>
                    <p className="text-sm font-medium text-gray-900">{client.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects tab */}
        <TabsContent value="projects" className="mt-4">
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
                    className="cursor-pointer select-none hover:text-gray-900"
                    onClick={() => handleSort('status')}
                  >
                    <span className="inline-flex items-center">
                      Status
                      <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-gray-900 text-right"
                    onClick={() => handleSort('contractValue')}
                  >
                    <span className="inline-flex items-center justify-end w-full">
                      Contract Value
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map(({ project, contractValue, marginForecast }) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900 py-3.5">
                      {project.name}
                      {(project.startDate || project.endDate) && (
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">
                          {formatDate(project.startDate)}
                          {project.endDate && ` — ${formatDate(project.endDate)}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={projectStatusColors[project.status as ProjectStatus]}>
                        {STATUS_LABELS[project.status as ProjectStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(contractValue)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {marginForecast != null ? formatCurrency(marginForecast) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
