import type { TimesheetEntry } from '@/api/types'
import type { ClosedPeriodRow, EntryRowState } from './types'

export const CURRENT_EMPLOYEE_ID = 'e1'

export function buildEntryRows(activeEntries: TimesheetEntry[]): EntryRowState[] {
  return activeEntries.map((entry) => ({
    id: entry.id,
    taskId: entry.taskId,
    profileId: entry.profileId,
    plannedDays: 0,
    actualDays: entry.days,
    notes: entry.notes,
    status: entry.status,
  }))
}

export function buildClosedPeriodRows(frozenEntries: TimesheetEntry[]): ClosedPeriodRow[] {
  const periodIds = [...new Set(frozenEntries.map((e) => e.periodId))]
  return periodIds.map((periodId) => {
    const entries = frozenEntries.filter((entry) => entry.periodId === periodId)
    const daysSubmitted = entries.reduce((sum, entry) => sum + entry.days, 0)
    const costAmount = entries.reduce((sum, entry) => sum + (entry.appliedCostAmount ?? 0), 0)

    return {
      periodId,
      label: periodId,
      daysSubmitted,
      costAmount,
      status: 'APPROVED',
    }
  })
}
