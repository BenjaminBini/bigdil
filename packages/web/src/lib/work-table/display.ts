import type { GridRow } from './types'

// Sticky-column layout for the work-table grid. The label column and the four
// summary columns (consommé / à valider / restant / à planifier) all stay
// pinned while the period axis scrolls under them.
export const LABEL_COL_WIDTH = 260
export const SUMMARY_COL_WIDTH = 52
export const SUMMARY_COL_COUNT = 4
export const SUMMARY_LEFTS = Array.from({ length: SUMMARY_COL_COUNT }, (_, i) => LABEL_COL_WIDTH + i * SUMMARY_COL_WIDTH)
export const STICKY_RIGHT_EDGE = LABEL_COL_WIDTH + SUMMARY_COL_COUNT * SUMMARY_COL_WIDTH

export function stickySummaryStyle(index: number) {
  return {
    position: 'sticky' as const,
    left: SUMMARY_LEFTS[index],
    minWidth: SUMMARY_COL_WIDTH,
    width: SUMMARY_COL_WIDTH,
    zIndex: 20,
    boxShadow: index === SUMMARY_COL_COUNT - 1 ? '2px 0 0 0 #cbd5e1' : undefined,
  }
}

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

// Translucent <tr> backgrounds — reversed gradient: phase is the lightest,
// employee the darkest. Each tier sits one shade darker than its parent.
export function getRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-card'
  if (row.kind === 'task') return 'bg-slate-100/70 dark:bg-slate-900/40'
  if (row.kind === 'profile') return 'bg-slate-200/70 dark:bg-slate-800/60'
  if (row.kind === 'employee') return 'bg-slate-300/70 dark:bg-slate-700/60'
  if (row.kind === 'grand-total') return 'bg-slate-400/80 dark:bg-slate-700'
  if (row.kind === 'quote') return 'bg-blue-50/40 dark:bg-blue-950/20'
  return 'bg-card'
}

// Solid (non-transparent) variant — applied to sticky cells so scrolling
// content slides under them without bleeding through.
export function getSolidRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-card'
  if (row.kind === 'task') return 'bg-slate-100 dark:bg-slate-900'
  if (row.kind === 'profile') return 'bg-slate-200 dark:bg-slate-800'
  if (row.kind === 'employee') return 'bg-slate-300 dark:bg-slate-700'
  if (row.kind === 'grand-total') return 'bg-slate-400 dark:bg-slate-700'
  if (row.kind === 'quote') return 'bg-blue-50 dark:bg-blue-950'
  return 'bg-card'
}

// All rows share the same height — full stop.
export function getRowPaddingY(_row: GridRow): string {
  return 'py-2'
}
