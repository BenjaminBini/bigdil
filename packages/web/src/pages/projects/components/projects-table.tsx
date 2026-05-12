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
import { deriveProjectLifecycle } from '@/lib/constants'

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
            <HeadCell label="Projet" />
            <HeadCell label="Statut" />
            <HeadCell label="Valeur contractuelle" align="right" />
            <HeadCell label="Période active" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message="Aucun projet trouvé" />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} variant="interactive" onClick={() => navigate(`/projects/${row.id}`)}>
                <TdDetail>{row.clientName ?? <NullCell />}</TdDetail>
                <TdPrimary>{row.name}</TdPrimary>
                <TdDetail>
                  <StatusBadge status={deriveProjectLifecycle(row)} />
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
