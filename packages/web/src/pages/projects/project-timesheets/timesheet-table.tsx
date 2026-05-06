import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TdPrimary, TdNumeric, TdDetail, TdRight, TdNumericPrimary } from '@/components/shared/table-cells'
import { HeadCell } from '@/components/shared/head-cell'
import { EmptyRow } from '@/components/shared/empty-row'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ColorValue } from '@/components/shared/color-value'
import { TextStrong } from '@/components/shared/text-strong'
import { HintText } from '@/components/shared/hint-text'
import { FlexRow } from '@/components/shared/layouts'
import { formatCurrency, formatDaysWithUnit } from '@/lib/format'
import { formatDelta, type TimesheetRow } from './model'

interface TimesheetTableProps {
  rows: TimesheetRow[]
  totalPlanned: number
  totalActual: number
  totalCost: number
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
}

export function TimesheetTable({
  rows,
  totalPlanned,
  totalActual,
  totalCost,
  getTaskName,
  getProfileName,
}: TimesheetTableProps) {
  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Period" />
            <HeadCell label="Employee" />
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            <HeadCell label="Planned Days" align="right" width="112px" />
            <HeadCell label="Actual Days" align="right" width="96px" />
            <HeadCell label="Delta" align="right" width="80px" />
            <HeadCell label="Cost Rate" align="right" width="112px" />
            <HeadCell label="Cost Amount" align="right" width="112px" />
            <HeadCell label="Status" width="96px" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={10} message="No timesheets match the current filters" />
          ) : (
            rows.map((row) => {
              const delta = row.actualDays - row.plannedDays
              const isLocked = row.periodStatus === 'FROZEN' || row.periodStatus === 'CONSOLIDATION'
              return (
                <TableRow key={row.id} className={isLocked ? '' : 'bg-amber-50/30'}>
                  <TableCell>
                    <FlexRow gap="sm">
                      <TextStrong size="sm" color="muted">{row.periodLabel}</TextStrong>
                      <StatusBadge status={row.periodStatus} />
                    </FlexRow>
                  </TableCell>
                  <TdPrimary>{row.employeeName}</TdPrimary>
                  <TdDetail>{getTaskName(row.taskId)}</TdDetail>
                  <TdDetail>{getProfileName(row.profileId)}</TdDetail>
                  <TdNumeric>{formatDaysWithUnit(row.plannedDays)}</TdNumeric>
                  <TdNumeric>{formatDaysWithUnit(row.actualDays)}</TdNumeric>
                  <TdRight>
                    <ColorValue
                      value={formatDelta(delta)}
                      sentiment={Math.abs(delta) === 0 ? 'positive' : Math.abs(delta) < 1 ? 'warning' : 'negative'}
                    />
                  </TdRight>
                  <TdNumeric>
                    {row.costRate != null ? (
                      <TextStrong>{formatCurrency(row.costRate)}/d</TextStrong>
                    ) : (
                      <HintText>pending</HintText>
                    )}
                  </TdNumeric>
                  <TdNumeric>
                    {row.costAmount != null ? (
                      <TextStrong>{formatCurrency(row.costAmount)}</TextStrong>
                    ) : (
                      <HintText>pending</HintText>
                    )}
                  </TdNumeric>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              )
            })
          )}

          {rows.length > 0 && (
            <TableRow variant="total">
              <TdPrimary colSpan={4}>
                Total ({rows.length} entries)
              </TdPrimary>
              <TdNumericPrimary>{formatDaysWithUnit(totalPlanned)}</TdNumericPrimary>
              <TdNumericPrimary>{formatDaysWithUnit(totalActual)}</TdNumericPrimary>
              <TdRight>
                <ColorValue
                  value={formatDelta(totalActual - totalPlanned)}
                  sentiment={Math.abs(totalActual - totalPlanned) === 0 ? 'positive' : Math.abs(totalActual - totalPlanned) < 1 ? 'warning' : 'negative'}
                />
              </TdRight>
              <TableCell />
              <TdNumericPrimary>
                {totalCost > 0 ? formatCurrency(totalCost) : '—'}
              </TdNumericPrimary>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
