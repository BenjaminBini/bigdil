import type { Timesheet, TimesheetStatus } from '@/api/types'

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
  periodCode: string
  label: string
  daysSubmitted: number
  costAmount: number
  status: TimesheetStatus
  timesheet: Timesheet
}
