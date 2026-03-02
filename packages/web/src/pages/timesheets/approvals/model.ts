import type { Employee, TimesheetEntry } from '@/api/types'
import { formatDaysWithUnit } from '@/lib/format'
import type { ApprovalRow, PastPeriodSummary } from './types'

export function formatDelta(delta: number): string {
  if (delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatDaysWithUnit(delta)}`
}

export function buildApprovalRows(approvals: TimesheetEntry[]): ApprovalRow[] {
  return approvals.map((ts) => ({
    id: ts.id,
    employeeId: ts.employeeId,
    taskId: ts.taskId,
    profileId: ts.profileId,
    projectId: ts.projectId,
    periodId: ts.periodId,
    plannedDays: 0,
    submittedDays: ts.days,
    status: ts.status,
  }))
}

export function buildPastPeriodSummaries(
  approvedRows: ApprovalRow[],
  employees: Employee[],
): PastPeriodSummary[] {
  const periodIds = [...new Set(approvedRows.map((r) => r.periodId))]
  return periodIds.map((periodId) => {
    const entries = approvedRows.filter((r) => r.periodId === periodId)
    const totalCost = entries.reduce((sum, entry) => {
      const employee = employees.find((e) => e.id === entry.employeeId)
      return sum + entry.submittedDays * (employee?.currentCostRatePerDay ?? 0)
    }, 0)

    return {
      periodId,
      totalEntries: entries.length,
      approvedEntries: entries.length,
      totalCost,
    }
  })
}
