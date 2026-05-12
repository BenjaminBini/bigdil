import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  projectLifecycleColors,
  periodStatusColors,
  quoteStatusColors,
  timesheetStatusColors,
  roleColors,
  taskStatusColors,
  miscStatusColors,
  type ProjectLifecycle,
} from '@/lib/constants'
import type { PeriodStatus, QuoteStatus, TimesheetStatus, UserRole, TaskStatus } from '@/api/types'

type KnownStatus =
  | ProjectLifecycle
  | PeriodStatus
  | QuoteStatus
  | TimesheetStatus
  | UserRole
  | TaskStatus

// Status string → statuses.json namespace key. Lookup order matters: more specific
// namespaces win over misc fallback. Some statuses (DRAFT, REJECTED) collide
// across namespaces — the first match here defines the label.
const STATUS_NAMESPACE: Record<string, string> = {
  // PeriodStatus
  FUTURE: 'period.FUTURE',
  OPEN: 'period.OPEN',
  CONSOLIDATION: 'period.CONSOLIDATION',
  FROZEN: 'period.FROZEN',
  // QuoteStatus
  SENT: 'quote.SENT',
  VALIDATED: 'quote.VALIDATED',
  CANCELLED: 'quote.CANCELLED',
  // TimesheetStatus
  SUBMITTED: 'timesheet.SUBMITTED',
  APPROVED: 'timesheet.APPROVED',
  // Shared between quote + timesheet — quote wins
  DRAFT: 'quote.DRAFT',
  REJECTED: 'quote.REJECTED',
  // TaskStatus (lowercase)
  planned: 'task.planned',
  active: 'task.active',
  done: 'task.done',
  // Project lifecycle (uses misc bucket)
  ACTIVE: 'misc.ACTIVE',
  INACTIVE: 'misc.INACTIVE',
  ACTUAL: 'misc.ACTUAL',
  PLANNED: 'misc.PLANNED',
  CLOSED: 'misc.CLOSED',
  UPCOMING: 'misc.UPCOMING',
  // Project lifecycle stages
  WAITING_APPROVAL: 'project.WAITING_APPROVAL',
  TO_PLAN: 'project.TO_PLAN',
  PLANNING: 'project.PLANNING',
  IN_PROGRESS: 'project.IN_PROGRESS',
  COMPLETED: 'project.COMPLETED',
  // Roles
  ADMIN: 'role.ADMIN',
  PM: 'role.PM',
  CONSULTANT: 'role.CONSULTANT',
  FINANCE: 'role.FINANCE',
  EXEC: 'role.EXEC',
}

/**
 * Resolve the Tailwind colour classes for a given status string.
 * Falls back to a neutral grey if the status is unrecognised.
 */
function resolveColors(status: string): string {
  const allMaps = [
    projectLifecycleColors as Record<string, string>,
    periodStatusColors as Record<string, string>,
    quoteStatusColors as Record<string, string>,
    timesheetStatusColors as Record<string, string>,
    roleColors as Record<string, string>,
    taskStatusColors as Record<string, string>,
    miscStatusColors as Record<string, string>,
  ]
  for (const map of allMaps) {
    if (status in map) return map[status]
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export interface StatusBadgeProps {
  status: KnownStatus | string
  label?: string
}

/**
 * A small pill badge that colours itself according to the provided status
 * string using the colour maps from constants.
 */
export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { t } = useTranslation('statuses')
  const colors = resolveColors(status)
  const nsKey = STATUS_NAMESPACE[status]
  const translated = nsKey ? t(nsKey, { defaultValue: status }) : status
  const displayLabel = label ?? translated

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colors,
      )}
    >
      {displayLabel}
    </span>
  )
}
