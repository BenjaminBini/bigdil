import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetricStrip } from '@/components/shared/metric-strip'
import { formatCurrency, formatDays } from '@/lib/format'
import type { Snapshot, TimesheetEntry } from '@/api/types'

interface ActualsTabProps {
  snapshot: Snapshot
  allTimesheets: TimesheetEntry[]
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
  getEmployeeName: (id: string) => string
}

export function ActualsTab({
  snapshot,
  allTimesheets,
  getTaskName,
  getProfileName,
  getEmployeeName,
}: ActualsTabProps) {
  const periodId = snapshot.periodId
  const asOfPeriodNumber = snapshot.periodNumber

  const periodActuals = allTimesheets.filter(
    (t) => t.periodId === periodId && t.status === 'APPROVED',
  )

  const closedPeriodIds = new Set(
    snapshot.workTableRows
      .filter(r => r.periodNumber <= asOfPeriodNumber)
      .map(r => r.periodId),
  )
  const cumulativeActuals = allTimesheets.filter(
    (t) => closedPeriodIds.has(t.periodId) && t.status === 'APPROVED',
  )

  function renderRows(entries: TimesheetEntry[]) {
    if (entries.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center text-gray-400 py-8">
            No approved timesheets
          </TableCell>
        </TableRow>
      )
    }
    return entries.map((entry) => (
      <TableRow key={entry.id} className="hover:bg-gray-50">
        <TableCell className="font-medium text-gray-900 text-sm">
          {getEmployeeName(entry.employeeId)}
        </TableCell>
        <TableCell className="text-gray-600 text-sm">{getTaskName(entry.taskId)}</TableCell>
        <TableCell className="text-gray-600 text-sm">{getProfileName(entry.profileId)}</TableCell>
        <TableCell className="text-right tabular-nums text-gray-700">{formatDays(entry.days)}</TableCell>
        <TableCell className="text-right tabular-nums text-gray-600">
          {entry.appliedCostRatePerDay != null ? formatCurrency(entry.appliedCostRatePerDay) : '—'}
        </TableCell>
        <TableCell className="text-right tabular-nums text-gray-700 font-medium">
          {entry.appliedCostAmount != null ? formatCurrency(entry.appliedCostAmount) : '—'}
        </TableCell>
        <TableCell className="text-right tabular-nums text-gray-600">
          {entry.appliedSellRatePerDay != null ? formatCurrency(entry.appliedSellRatePerDay) : '—'}
        </TableCell>
        <TableCell className="text-right tabular-nums text-gray-700 font-medium">
          {entry.appliedSellAmount != null ? formatCurrency(entry.appliedSellAmount) : '—'}
        </TableCell>
      </TableRow>
    ))
  }

  const periodCost = periodActuals.reduce((s, t) => s + (t.appliedCostAmount ?? 0), 0)
  const periodSell = periodActuals.reduce((s, t) => s + (t.appliedSellAmount ?? 0), 0)
  const cumCost = cumulativeActuals.reduce((s, t) => s + (t.appliedCostAmount ?? 0), 0)
  const cumSell = cumulativeActuals.reduce((s, t) => s + (t.appliedSellAmount ?? 0), 0)

  const colHeaders = (
    <TableRow className="bg-gray-50">
      <TableHead>Employee</TableHead>
      <TableHead>Task</TableHead>
      <TableHead>Profile</TableHead>
      <TableHead className="text-right">Days</TableHead>
      <TableHead className="text-right">Cost Rate/day</TableHead>
      <TableHead className="text-right">Cost Amount</TableHead>
      <TableHead className="text-right">Sell Rate/day</TableHead>
      <TableHead className="text-right">Sell Amount</TableHead>
    </TableRow>
  )

  return (
    <div className="pt-4 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Period {snapshot.periodNumber} — Approved Timesheets
          </h3>
          <MetricStrip items={[
            { label: 'Cost', value: <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(periodCost)}</span> },
            { label: 'Sell', value: <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(periodSell)}</span> },
          ]} />
        </div>
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>{colHeaders}</TableHeader>
            <TableBody>{renderRows(periodActuals)}</TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Cumulative — Periods 1–{snapshot.periodNumber}
          </h3>
          <MetricStrip items={[
            { label: 'Cost', value: <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(cumCost)}</span> },
            { label: 'Sell', value: <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(cumSell)}</span> },
          ]} />
        </div>
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>{colHeaders}</TableHeader>
            <TableBody>{renderRows(cumulativeActuals)}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
