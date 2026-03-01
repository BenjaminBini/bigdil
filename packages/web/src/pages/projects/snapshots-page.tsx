import { useState } from 'react'
import { useParams } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProject, useSnapshots } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import PeriodCloseWizard from './period-close-wizard'
import { PeriodRow, periodAlerts } from './snapshots/period-row'

// ---- Page ----

export default function SnapshotsPage() {
  const { id: projectId } = useParams()
  const [wizardOpen, setWizardOpen] = useState(false)

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: snapshots, isLoading: snapsLoading, error: snapsError } = useSnapshots(projectId!)

  const isLoading = projectLoading || snapsLoading
  const hasError = projectError || snapsError

  if (isLoading) return <div className="p-6">Loading...</div>
  if (hasError || !project || !snapshots) return <div className="p-6">Error loading data</div>

  const periods = project.periods
  const snapshotByPeriodId = new Map(snapshots.map((s) => [s.periodId, s]))

  // Find the OPEN period number
  const openPeriod = periods.find((p) => p.status === 'OPEN')
  const openPeriodNumber = openPeriod?.periodNumber ?? null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Periods &amp; Snapshots
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {periods.length} periods — {snapshots.length} snapshots recorded
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Period #
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Dates
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Snapshot Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Contract Value
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Margin Forecast
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Produced Value (period)
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Alerts
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                  No periods found for this project
                </TableCell>
              </TableRow>
            ) : (
              periods.map((period) => {
                const snapshot = snapshotByPeriodId.get(period.id)

                // Determine if "Open Period" should be shown
                // Only for the first FUTURE period immediately after the OPEN period
                const canOpen =
                  period.status === 'FUTURE' &&
                  openPeriodNumber !== null &&
                  period.periodNumber === openPeriodNumber + 1

                // Metric values
                const contractValue =
                  period.status === 'FROZEN' && snapshot
                    ? snapshot.metrics?.contractValue ?? null
                    : (period.status === 'CONSOLIDATION' || period.status === 'OPEN')
                    ? project.contractValue
                    : null

                const marginForecast =
                  period.status === 'FROZEN' && snapshot
                    ? snapshot.metrics?.marginForecast ?? null
                    : null

                const producedValue =
                  period.status === 'FROZEN' && snapshot
                    ? snapshot.metrics?.producedExecutionValuePeriod ?? null
                    : null

                return (
                  <PeriodRow
                    key={period.id}
                    periodNumber={period.periodNumber}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    status={period.status}
                    snapshotDate={snapshot?.snapshotAt ?? null}
                    contractValue={contractValue}
                    marginForecast={marginForecast}
                    producedValue={producedValue}
                    alerts={periodAlerts(period.periodNumber)}
                    snapshotId={snapshot?.id ?? null}
                    projectId={projectId ?? ''}
                    canOpen={canOpen}
                    onFreezePeriod={() => setWizardOpen(true)}
                  />
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Snapshot summary strip */}
      {snapshots.length > 0 && (
        <div className="rounded-lg border bg-blue-50 border-blue-200 px-5 py-4">
          <p className="text-sm font-medium text-blue-800 mb-3">Snapshot Summary</p>
          <div className="flex flex-wrap gap-4">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex flex-col gap-0.5 rounded-md bg-white border border-blue-100 px-3 py-2 text-xs shadow-xs"
              >
                <span className="font-semibold text-gray-700">Period {snap.periodNumber}</span>
                <span className="text-gray-500">{formatDate(snap.snapshotAt)}</span>
                <span className="text-green-700 font-medium">
                  {snap.metrics ? formatCurrency(snap.metrics.producedExecutionValuePeriod) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period close wizard */}
      <PeriodCloseWizard open={wizardOpen} onClose={() => setWizardOpen(false)} projectId={projectId!} />
    </div>
  )
}
