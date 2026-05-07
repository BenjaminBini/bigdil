import type { ProjectStatus, PeriodStatus, QuoteStatus, TimesheetStatus, UserRole, TaskStatus } from '@/api/types'

export const projectStatusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  WAITING_APPROVAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  TO_PLAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
  PLANNING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
  IN_PROGRESS: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Brouillon',
  WAITING_APPROVAL: 'En attente',
  TO_PLAN: 'À planifier',
  PLANNING: 'Planification',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
}

export const periodStatusColors: Record<PeriodStatus, string> = {
  FROZEN: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  CONSOLIDATION: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  OPEN: 'bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300',
  FUTURE: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
}

export const periodStatusLabels: Record<PeriodStatus, string> = {
  FROZEN: 'Clôturée',
  CONSOLIDATION: 'Consolidation',
  OPEN: 'Ouverte',
  FUTURE: 'Future',
}

export const quoteStatusColors: Record<QuoteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  SENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  VALIDATED: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
}

export const timesheetStatusColors: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  SUBMITTED: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
}

export const timesheetStatusLabels: Record<TimesheetStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
}

export const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
  PM: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
  CONSULTANT: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300',
  FINANCE: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  EXEC: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export const taskStatusColors: Record<TaskStatus, string> = {
  planned: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  active: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900',
  done: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

export const miscStatusColors: Record<string, string> = {
  ACTIVE: 'border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300',
  INACTIVE: 'border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/70 dark:text-red-300',
  ACTUAL: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300',
  PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}
