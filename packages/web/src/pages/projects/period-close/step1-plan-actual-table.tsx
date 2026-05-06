import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { formatDays } from '@/lib/format'
import { ColorValue } from '@/components/shared/color-value'
import { StatusBadge } from '@/components/shared/status-badge'
import { TdPrimary, TdNumeric, TdRight, TdDetail } from '@/components/shared/table-cells'
import { SectionTitle } from '@/components/shared/page-title'
import { HeadCell } from '@/components/shared/head-cell'
import type { TimesheetStatus } from '@/api/types'

interface PlanActualRow {
  id: string
  employee: string
  task: string
  plannedDays: number
  actualDays: number
  status: TimesheetStatus
}

interface Step1PlanActualTableProps {
  periodNumber: number
  rows: PlanActualRow[]
}

export function Step1PlanActualTable({ periodNumber, rows }: Step1PlanActualTableProps) {
  return (
    <div>
      <SectionTitle spacing="sm">Plan vs. Actual - Period {periodNumber}</SectionTitle>
      <Card variant="flush">
        <Table variant="compact">
          <TableHeader>
            <TableRow variant="header">
              <HeadCell variant="compact" label="Employee" />
              <HeadCell variant="compact" label="Task" />
              <HeadCell variant="compact" label="Planned Days" align="right" />
              <HeadCell variant="compact" label="Actual Days" align="right" />
              <HeadCell variant="compact" label="Delta" align="right" />
              <HeadCell variant="compact" label="Status" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const delta = row.actualDays - row.plannedDays
              return (
                <TableRow key={row.id}>
                  <TdPrimary>{row.employee}</TdPrimary>
                  <TdDetail>{row.task}</TdDetail>
                  <TdNumeric>{formatDays(row.plannedDays)}</TdNumeric>
                  <TdNumeric>{formatDays(row.actualDays)}</TdNumeric>
                  <TdRight>
                    <ColorValue
                      value={delta === 0 ? '—' : delta > 0 ? `+${formatDays(delta)}` : formatDays(delta)}
                      sentiment={delta > 0 ? 'warning' : delta < 0 ? 'positive' : 'neutral'}
                    />
                  </TdRight>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

