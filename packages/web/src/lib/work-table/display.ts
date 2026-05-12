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

// <tr> backgrounds — hierarchy tiers fading from card toward foreground.
// Tier colors come from `--row-*` CSS vars in index.css, which use
// color-mix() to derive shades from the active theme. This makes the
// gradient adapt to every theme automatically (light, dark, cappuccino,
// mocha, …) without per-theme overrides.
export function getRowBackground(row: GridRow): string {
  if (row.kind === 'phase') return 'bg-row-phase'
  if (row.kind === 'task') return 'bg-row-task'
  if (row.kind === 'profile') return 'bg-row-profile'
  if (row.kind === 'employee') return 'bg-row-employee'
  if (row.kind === 'grand-total') return 'bg-row-total'
  if (row.kind === 'quote') return 'bg-row-quote'
  return 'bg-card'
}

// Solid variant — applied to sticky cells so scrolling content slides
// under them without bleeding through. With the color-mix recipe the
// derived shades are already opaque, so solid == translucent here.
export function getSolidRowBackground(row: GridRow): string {
  return getRowBackground(row)
}

// All rows share the same height — full stop.
export function getRowPaddingY(_row: GridRow): string {
  return 'py-2'
}
