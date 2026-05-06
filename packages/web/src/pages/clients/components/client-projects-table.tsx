import { useNavigate } from 'react-router'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { TdPrimary, TdNumericPrimary, TdNumeric } from '@/components/shared/table-cells'
import { SortableHead } from '@/components/shared/sortable-head'
import { StatusBadge } from '@/components/shared/status-badge'
import { TextCaption } from '@/components/shared/text-caption'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ProjectListItem, ProjectStatus } from '@/api/types'
import {
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
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <SortableHead label="Name" col="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Status" col="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Contract Value" col="contractValue" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label="Margin Forecast" col="marginForecast" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ project, contractValue, marginForecast }) => (
            <TableRow key={project.id} variant="interactive" onClick={() => navigate(`/projects/${project.id}`)}>
              <TdPrimary>
                {project.name}
                {(project.startDate || project.endDate) && (
                  <TextCaption>
                    {formatDate(project.startDate)}
                    {project.endDate && ` — ${formatDate(project.endDate)}`}
                  </TextCaption>
                )}
              </TdPrimary>
              <TableCell>
                <StatusBadge status={project.status as ProjectStatus} />
              </TableCell>
              <TdNumericPrimary>{formatCurrency(contractValue)}</TdNumericPrimary>
              <TdNumeric>
                {marginForecast != null ? formatCurrency(marginForecast) : '—'}
              </TdNumeric>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}