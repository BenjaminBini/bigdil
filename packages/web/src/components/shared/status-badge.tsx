import { cn } from '@/lib/utils'
import {
  projectStatusColors,
  periodStatusColors,
  quoteStatusColors,
  timesheetStatusColors,
} from '@/lib/constants'
import type { ProjectStatus, PeriodStatus, QuoteStatus, TimesheetStatus } from '@/api/types'

type KnownStatus =
  | ProjectStatus
  | PeriodStatus
  | QuoteStatus
  | TimesheetStatus

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
  ]
  for (const map of allMaps) {
    if (status in map) return map[status]
  }
  return 'bg-gray-100 text-gray-600'
}

export interface StatusBadgeProps {
  status: KnownStatus | string
  className?: string
}

/**
 * A small pill badge that colours itself according to the provided status
 * string using the colour maps from mock data.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = resolveColors(status)
  const label = STATUS_LABEL[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colors,
        className,
      )}
    >
      {label}
    </span>
  )
}
