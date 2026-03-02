import type { ProjectStatus } from '@/api/types'

export type ClientProjectSortKey = 'name' | 'status' | 'contractValue' | 'marginForecast'
export type SortDir = 'asc' | 'desc'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  WAITING_APPROVAL: 'Waiting Approval',
  TO_PLAN: 'To Plan',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}
