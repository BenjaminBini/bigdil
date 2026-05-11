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

export function getRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-muted/50'
  if (row.kind === 'grand-total') return 'bg-muted'
  if (row.kind === 'task') return 'bg-card'
  if (row.kind === 'quote') return 'bg-blue-50/40 dark:bg-blue-950/20'
  if (row.kind === 'profile') return 'bg-muted/20'
  return 'bg-card'
}

// Solid (non-transparent) variant of getRowBackground — applied to sticky
// cells so scrolling content slides under them without bleeding through.
export function getSolidRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-muted'
  if (row.kind === 'grand-total') return 'bg-muted'
  if (row.kind === 'task') return 'bg-card'
  if (row.kind === 'quote') return 'bg-blue-50 dark:bg-blue-950'
  if (row.kind === 'profile') return 'bg-card'
  return 'bg-card'
}
