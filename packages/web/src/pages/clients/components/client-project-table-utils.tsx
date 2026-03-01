import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { ProjectStatus } from '@/api/types'

export type ClientProjectSortKey = 'name' | 'status' | 'contractValue' | 'marginForecast'
export type SortDir = 'asc' | 'desc'

export function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: ClientProjectSortKey
  sortKey: ClientProjectSortKey
  sortDir: SortDir
}) {
  if (col !== sortKey) return <ArrowUpDown className="size-3.5 ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ArrowUp className="size-3.5 ml-1" />
    : <ArrowDown className="size-3.5 ml-1" />
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  WAITING_APPROVAL: 'Waiting Approval',
  TO_PLAN: 'To Plan',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}
