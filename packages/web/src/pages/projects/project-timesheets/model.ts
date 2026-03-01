import { formatDaysWithUnit } from '@/lib/format'
import type { TimesheetEntry, Period, WorkTableCell, TimesheetStatus } from '@/api/types'

export interface TimesheetRow {
  id: string
  periodId: string
  periodNumber: number
  periodLabel: string
  periodStatus: string
  employeeId: string
  employeeName: string
  taskId: string
  profileId: string
  plannedDays: number
  actualDays: number
  costRate: number | null
  costAmount: number | null
  status: TimesheetStatus
}

export const ALL_VALUE = 'all'

export const statusOptions: { value: string; label: string }[] = [
  { value: ALL_VALUE, label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function getPlannedDays(
  taskId: string,
  profileId: string,
  employeeId: string | null,
  periodId: string,
  workTable: WorkTableCell[],
): number {
  const cell = workTable.find(
    (c) =>
      c.taskId === taskId &&
      c.profileId === profileId &&
      c.employeeId === employeeId &&
      c.periodId === periodId,
  )
  return cell?.days ?? 0
}

export function buildRows(
  timesheets: TimesheetEntry[],
  periods: Period[],
  workTable: WorkTableCell[],
  getEmployeeName: (id: string) => string,
): TimesheetRow[] {
  return timesheets.map((ts: TimesheetEntry) => {
    const period = periods.find((p) => p.id === ts.periodId)!
    const planned = getPlannedDays(ts.taskId, ts.profileId, ts.employeeId, ts.periodId, workTable)
    return {
      id: ts.id,
      periodId: ts.periodId,
      periodNumber: period.periodNumber,
      periodLabel: `W${period.periodNumber}`,
      periodStatus: period.status,
      employeeId: ts.employeeId,
      employeeName: getEmployeeName(ts.employeeId),
      taskId: ts.taskId,
      profileId: ts.profileId,
      plannedDays: planned,
      actualDays: ts.days,
      costRate: ts.appliedCostRatePerDay,
      costAmount: ts.appliedCostAmount,
      status: ts.status,
    }
  })
}

export function deltaColor(delta: number): string {
  const abs = Math.abs(delta)
  if (abs === 0) return 'text-green-600'
  if (abs < 1) return 'text-amber-600'
  return 'text-red-600'
}

export function formatDelta(delta: number): string {
  if (delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatDaysWithUnit(delta)}`
}

export function exportCsv(
  rows: TimesheetRow[],
  projectName: string,
  getTaskName: (id: string) => string,
  getProfileName: (id: string) => string,
) {
  const headers = [
    'Period',
    'Employee',
    'Task',
    'Profile',
    'Planned Days',
    'Actual Days',
    'Delta',
    'Cost Rate (€/d)',
    'Cost Amount (€)',
    'Status',
  ]
  const lines = rows.map((r) => {
    const delta = r.actualDays - r.plannedDays
    return [
      r.periodLabel,
      r.employeeName,
      getTaskName(r.taskId),
      getProfileName(r.profileId),
      r.plannedDays,
      r.actualDays,
      delta,
      r.costRate ?? '',
      r.costAmount ?? '',
      r.status,
    ]
      .map((v) => `"${v}"`)
      .join(',')
  })
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timesheets-${projectName.replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
