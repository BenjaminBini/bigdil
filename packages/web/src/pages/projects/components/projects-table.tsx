import { useNavigate } from 'react-router'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { TdPrimary, TdNumericPrimary, TdDetail, NullCell } from '@/components/shared/table-cells'
import { EmptyRow } from '@/components/shared/empty-row'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card } from '@/components/ui/card'
import type { ProjectListItem } from '@/api/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface ProjectsTableProps {
  rows: ProjectListItem[]
}

export function ProjectsTable({ rows }: ProjectsTableProps) {
  const navigate = useNavigate()

  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Client" />
            <HeadCell label="Project" />
            <HeadCell label="Status" />
            <HeadCell label="Contract Value" align="right" />
            <HeadCell label="Active Period" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message="No projects found" />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} variant="interactive" onClick={() => navigate(`/projects/${row.id}`)}>
                <TdDetail>{row.clientName ?? <NullCell />}</TdDetail>
                <TdPrimary>{row.name}</TdPrimary>
                <TdDetail>
                  <StatusBadge status={row.status} />
                </TdDetail>
                <TdNumericPrimary>{formatCurrency(row.contractValue)}</TdNumericPrimary>
                <TdDetail>
                  {row.startDate || row.endDate ? (
                    <>{formatDate(row.startDate)} - {formatDate(row.endDate)}</>
                  ) : (
                    <NullCell />
                  )}
                </TdDetail>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
