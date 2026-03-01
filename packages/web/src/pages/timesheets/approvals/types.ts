import type { TimesheetStatus } from '@/api/types'

export interface ApprovalRow {
  id: string
  employeeId: string
  taskId: string
  profileId: string
  projectId: string
  periodId: string
  plannedDays: number
  submittedDays: number
  status: TimesheetStatus
}

export interface PastPeriodSummary {
  periodId: string
  totalEntries: number
  approvedEntries: number
  totalCost: number
}
