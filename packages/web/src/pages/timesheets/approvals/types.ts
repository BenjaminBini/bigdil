import type { Timesheet, TimesheetStatus } from '@/api/types'

export interface ApprovalRow {
  id: string
  employeeId: string
  periodCode: string
  entryCount: number
  totalDays: number
  status: TimesheetStatus
  timesheet: Timesheet
}

