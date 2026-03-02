import type { TimesheetStatus } from '@/api/types'

export interface EntryRowState {
  id: string
  taskId: string
  profileId: string
  plannedDays: number
  actualDays: number
  notes: string
  status: TimesheetStatus
}

export interface ClosedPeriodRow {
  periodId: string
  label: string
  daysSubmitted: number
  costAmount: number
  status: TimesheetStatus
}
