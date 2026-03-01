import type { GridRow } from './types'

export function isRowVisible(
  row: GridRow,
  collapsedPhases: Set<string>,
  collapsedTasks: Set<string>,
): boolean {
  if (row.kind === 'grand-total') return true
  if (row.kind === 'phase') return true
  if (collapsedPhases.has(row.phaseId)) return false
  if (row.kind === 'task') return true
  if (row.taskId && collapsedTasks.has(row.taskId)) return false
  return true
}

export function getRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-slate-50'
  if (row.kind === 'grand-total') return 'bg-slate-100'
  if (row.kind === 'task') return 'bg-white'
  if (row.kind === 'profile') return 'bg-[#f9fafb]'
  return 'bg-white'
}
