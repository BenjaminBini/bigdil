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
  DRAFT: 'Brouillon',
  WAITING_APPROVAL: 'En attente',
  TO_PLAN: 'À planifier',
  PLANNING: 'Planification',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  // PeriodStatus
  FUTURE: 'Future',
  OPEN: 'Ouverte',
  CONSOLIDATION: 'Consolidation',
  FROZEN: 'Clôturée',
  // QuoteStatus
  SENT: 'Envoyé',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté',
  // TimesheetStatus
  SUBMITTED: 'Soumise',
  APPROVED: 'Approuvée',
  // TaskStatus (lowercase)
  planned: 'Prévu',
  active: 'Actif',
  done: 'Terminé',
  // Misc
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  ACTUAL: 'Réel',
  PLANNED: 'Prévu',
  CLOSED: 'Fermé',
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
