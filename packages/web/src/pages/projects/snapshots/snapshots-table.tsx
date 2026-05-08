import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { EmptyRow } from '@/components/shared/empty-row'
import { Card } from '@/components/ui/card'
import type { Period, Snapshot } from '@/api/types'
import { PeriodRow } from './period-row'

interface SnapshotsTableProps {
  periods: Period[]
  snapshots: Snapshot[]
  contractValue: number
  projectId: string
  onFreezePeriod: () => void
}

function periodAlerts(periodNumber: number): string[] {
  if (periodNumber === 3) return ['Change order validated — scope increased']
  if (periodNumber === 4) return ['Cost rate updated for Jean Martin']
  return []
}

export function SnapshotsTable({ periods, snapshots, contractValue, projectId, onFreezePeriod }: SnapshotsTableProps) {
  const snapshotByPeriodId = new Map(snapshots.map((snapshot) => [snapshot.periodId, snapshot]))
  const openPeriodNumber = periods.find((period) => period.status === 'OPEN')?.periodNumber ?? null

  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Period #" />
            <HeadCell label="Dates" />
            <HeadCell label="Status" />
            <HeadCell label="Snapshot Date" wrap />
            <HeadCell label="Contract Value" align="right" wrap />
            <HeadCell label="Margin Forecast" align="right" wrap />
            <HeadCell label="Produced Value (period)" align="right" wrap />
            <HeadCell label="Alerts" />
            <HeadCell label="Actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.length === 0 ? (
            <EmptyRow colSpan={9} message="No periods found for this project" />
          ) : (
            periods.map((period) => {
              const snapshot = snapshotByPeriodId.get(period.id)
              const canOpen =
                period.status === 'FUTURE' &&
                openPeriodNumber !== null &&
                period.periodNumber === openPeriodNumber + 1

              const contractValueCell =
                period.status === 'FROZEN' && snapshot
                  ? snapshot.metrics?.contractValue ?? null
                  : period.status === 'CONSOLIDATION' || period.status === 'OPEN'
                    ? contractValue
                    : null

              const marginForecast =
                period.status === 'FROZEN' && snapshot ? snapshot.metrics?.marginForecast ?? null : null

              const producedValue =
                period.status === 'FROZEN' && snapshot
                  ? snapshot.metrics?.producedExecutionValuePeriod ?? null
                  : null

              return (
                <PeriodRow
                  key={period.id}
                  periodId={period.id}
                  periodNumber={period.periodNumber}
                  startDate={period.startDate}
                  endDate={period.endDate}
                  status={period.status}
                  snapshotDate={snapshot?.snapshotAt ?? null}
                  contractValue={contractValueCell}
                  marginForecast={marginForecast}
                  producedValue={producedValue}
                  alerts={periodAlerts(period.periodNumber)}
                  snapshotId={snapshot?.id ?? null}
                  projectId={projectId}
                  canOpen={canOpen}
                  onFreezePeriod={onFreezePeriod}
                />
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}