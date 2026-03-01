import type { ProjectStatus, PeriodStatus, QuoteStatus, TimesheetStatus } from '@/api/types'

export const projectStatusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  WAITING_APPROVAL: 'bg-amber-100 text-amber-800',
  TO_PLAN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  WAITING_APPROVAL: 'Waiting Approval',
  TO_PLAN: 'To Plan',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

export const periodStatusColors: Record<PeriodStatus, string> = {
  FROZEN: 'bg-gray-100 text-gray-600',
  CONSOLIDATION: 'bg-amber-100 text-amber-700',
  OPEN: 'bg-green-100 text-green-700',
  FUTURE: 'bg-blue-50 text-blue-600',
}

export const periodStatusLabels: Record<PeriodStatus, string> = {
  FROZEN: 'Frozen',
  CONSOLIDATION: 'Consolidation',
  OPEN: 'Open',
  FUTURE: 'Future',
}

export const quoteStatusColors: Record<QuoteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-amber-100 text-amber-800',
  VALIDATED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export const timesheetStatusColors: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export const timesheetStatusLabels: Record<TimesheetStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}
