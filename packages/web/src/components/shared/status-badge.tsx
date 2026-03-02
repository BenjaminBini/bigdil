import { cn } from '@/lib/utils'
import {
  projectStatusColors,
  periodStatusColors,
  quoteStatusColors,
  timesheetStatusColors,
  roleColors,
  taskStatusColors,
  miscStatusColors,
} from '@/lib/constants'
import type { ProjectStatus, PeriodStatus, QuoteStatus, TimesheetStatus, UserRole, TaskStatus } from '@/api/types'

type KnownStatus =
  | ProjectStatus
  | PeriodStatus
  | QuoteStatus
  | TimesheetStatus
  | UserRole
  | TaskStatus

const STATUS_LABEL: Record<string, string> = {
  // ProjectStatus
  DRAFT: 'Draft',
  WAITING_APPROVAL: 'Waiting Approval',
  TO_PLAN: 'To Plan',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  // PeriodStatus
  FUTURE: 'Future',
  OPEN: 'Open',
  CONSOLIDATION: 'Consolidation',
  FROZEN: 'Frozen',
  // QuoteStatus
  SENT: 'Sent',
  VALIDATED: 'Validated',
  REJECTED: 'Rejected',
  // TimesheetStatus
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  // TaskStatus (lowercase)
  planned: 'Planned',
  active: 'Active',
  done: 'Done',
  // Misc
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ACTUAL: 'Actual',
  PLANNED: 'Planned',
  CLOSED: 'Closed',
}

/**
 * Resolve the Tailwind colour classes for a given status string.
 * Falls back to a neutral grey if the status is unrecognised.
 */
function resolveColors(status: string): string {
  const allMaps = [
    projectStatusColors as Record<string, string>,
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
  return 'bg-gray-100 text-gray-600'
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
  const colors = resolveColors(status)
  const displayLabel = label ?? STATUS_LABEL[status] ?? status

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
