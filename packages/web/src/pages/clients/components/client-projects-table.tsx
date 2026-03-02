import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { SortableHead } from '@/components/shared/sortable-head'
import { projectStatusColors } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ProjectListItem, ProjectStatus } from '@/api/types'
import {
  STATUS_LABELS,
  type ClientProjectSortKey,
  type SortDir,
} from './client-project-table-utils'

interface ProjectRow {
  project: ProjectListItem
  contractValue: number
  marginForecast: number | null
}

interface ClientProjectsTableProps {
  rows: ProjectRow[]
  sortKey: ClientProjectSortKey
  sortDir: SortDir
  onSort: (key: ClientProjectSortKey) => void
}

export function ClientProjectsTable({ rows, sortKey, sortDir, onSort }: ClientProjectsTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <SortableHead label="Name" col="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Status" col="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Contract Value" col="contractValue" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label="Margin Forecast" col="marginForecast" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ project, contractValue, marginForecast }) => (
            <TableRow key={project.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/projects/${project.id}`)}>
              <TableCell className="py-3.5 font-medium text-gray-900">
                {project.name}
                {(project.startDate || project.endDate) && (
                  <span className="mt-0.5 block text-xs font-normal text-gray-400">
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
              <TableCell className="text-right font-medium text-gray-900">{formatCurrency(contractValue)}</TableCell>
              <TableCell className="text-right text-gray-700">
                {marginForecast != null ? formatCurrency(marginForecast) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}