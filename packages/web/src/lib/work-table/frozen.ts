import { formatCurrency, formatDays } from '@/lib/format'
import type { PeriodInfo } from '@/api/types'
import type { FrozenData, GridRow } from './types'

export interface FrozenColDef {
  key: string
  label: string
  w: number
  format: 'days' | 'currency' | 'rate' | 'margin'
  group: 'Total' | 'Period'
  subGroup: 'Cost' | 'Revenue' | 'Margin'
}

export const FROZEN_COLS: FrozenColDef[] = [
  { key: 'tc_spent', label: 'Spent', w: 56, format: 'days', group: 'Total', subGroup: 'Cost' },
  { key: 'tc_rem', label: 'Rem.', w: 56, format: 'days', group: 'Total', subGroup: 'Cost' },
  { key: 'tc_total', label: 'Total', w: 56, format: 'days', group: 'Total', subGroup: 'Cost' },
  { key: 'tc_amount', label: 'Amount', w: 80, format: 'currency', group: 'Total', subGroup: 'Cost' },
  { key: 'tr_sold', label: 'Sold', w: 56, format: 'days', group: 'Total', subGroup: 'Revenue' },
  { key: 'tr_rate', label: 'Rate', w: 64, format: 'rate', group: 'Total', subGroup: 'Revenue' },
  { key: 'tr_amount', label: 'Amount', w: 80, format: 'currency', group: 'Total', subGroup: 'Revenue' },
  { key: 'tr_margin', label: 'Margin', w: 108, format: 'margin', group: 'Total', subGroup: 'Margin' },
  { key: 'pc_spent', label: 'Spent', w: 56, format: 'days', group: 'Period', subGroup: 'Cost' },
  { key: 'pc_cost', label: 'Cost', w: 64, format: 'rate', group: 'Period', subGroup: 'Cost' },
  { key: 'pc_amount', label: 'Amount', w: 80, format: 'currency', group: 'Period', subGroup: 'Cost' },
  { key: 'pr_produced', label: 'Prod.', w: 56, format: 'days', group: 'Period', subGroup: 'Revenue' },
  { key: 'pr_amount', label: 'Amount', w: 80, format: 'currency', group: 'Period', subGroup: 'Revenue' },
  { key: 'pr_margin', label: 'Margin', w: 108, format: 'margin', group: 'Period', subGroup: 'Margin' },
]

export const FROZEN_GROUPS = [
  { label: 'Total', colSpan: 8 },
  { label: 'Period', colSpan: 6 },
]

export const FROZEN_SUBGROUPS = [
  { label: 'Cost', colSpan: 4 },
  { label: 'Revenue', colSpan: 3 },
  { label: 'Margin', colSpan: 1 },
  { label: 'Cost', colSpan: 3 },
  { label: 'Revenue', colSpan: 2 },
  { label: 'Margin', colSpan: 1 },
]

function aggregateFrozen(children: GridRow[], data: Map<string, FrozenData>): FrozenData {
  let tcDaysSpent = 0
  let tcDaysRemaining = 0
  let tcTotalDays = 0
  let tcAmount = 0
  let trDaysSold = 0
  let trAmount = 0
  let pcDaysSpent = 0
  let pcAmount = 0
  let prDaysProduced = 0
  let prAmount = 0

  for (const child of children) {
    const d = data.get(child.id)
    if (!d) continue
    tcDaysSpent += d.tcDaysSpent
    tcDaysRemaining += d.tcDaysRemaining
    tcTotalDays += d.tcTotalDays
    tcAmount += d.tcAmount
    trDaysSold += d.trDaysSold
    trAmount += d.trAmount
    pcDaysSpent += d.pcDaysSpent
    pcAmount += d.pcAmount
    prDaysProduced += d.prDaysProduced
    prAmount += d.prAmount
  }

  const trMargin = trAmount - tcAmount
  const prMargin = prAmount - pcAmount

  return {
    tcDaysSpent,
    tcDaysRemaining,
    tcTotalDays,
    tcAmount,
    trDaysSold,
    trDailyRate: null,
    trAmount,
    trMargin,
    trMarginPct: trAmount !== 0 ? (trMargin / trAmount) * 100 : null,
    pcDaysSpent,
    pcDailyCost: pcDaysSpent > 0 ? pcAmount / pcDaysSpent : null,
    pcAmount,
    prDaysProduced,
    prAmount,
    prMargin,
    prMarginPct: prAmount !== 0 ? (prMargin / prAmount) * 100 : null,
  }
}

export interface ComputeFrozenOptions {
  /** Map of `${taskId}::${profileId}` → RAF days from the previous snapshot.
   *  When provided, profile/task/phase Period Revenue uses (prevRAF - currentRAF)
   *  * sellRate instead of cells[activePeriodCode] * sellRate.
   *  Missing keys fall back to row.quotedDays (first-period semantics). */
  prevSnapshotRaf?: Map<string, number>
}

export function computeFrozenData(
  rows: GridRow[],
  periods: PeriodInfo[],
  overridePeriodCode?: string | string[],
  options?: ComputeFrozenOptions,
): Map<string, FrozenData> {
  // Default to the single OPEN period; the consolidation flow passes every
  // CONSOLIDATION-status period so cost cells aggregate across all of them.
  const activePeriodCodes: string[] = overridePeriodCode === undefined
    ? [periods.find((p) => p.status === 'OPEN')?.code ?? '']
    : Array.isArray(overridePeriodCode)
      ? overridePeriodCode
      : [overridePeriodCode]
  const sumCells = (cells: Record<string, number>): number =>
    activePeriodCodes.reduce((s, code) => s + (cells[code] ?? 0), 0)
  const prevRafMap = options?.prevSnapshotRaf
  const useRafDeltaRevenue = prevRafMap !== undefined
  const result = new Map<string, FrozenData>()

  for (const row of rows) {
    if (row.kind !== 'employee') continue
    const costRate = row.forecastCostRate ?? 0
    const sellRate = row.forecastSellRate ?? 0
    const periodDays = sumCells(row.cells)
    const pcAmount = periodDays * costRate
    const prAmount = periodDays * sellRate
    const prMargin = prAmount - pcAmount
    result.set(row.id, {
      tcDaysSpent: row.totalActual,
      tcDaysRemaining: row.totalRemaining,
      tcTotalDays: row.total,
      tcAmount: row.total * costRate,
      trDaysSold: 0,
      trDailyRate: sellRate || null,
      trAmount: 0,
      trMargin: 0,
      trMarginPct: null,
      pcDaysSpent: periodDays,
      pcDailyCost: costRate || null,
      pcAmount,
      prDaysProduced: periodDays,
      prAmount,
      prMargin,
      prMarginPct: prAmount !== 0 ? (prMargin / prAmount) * 100 : null,
    })
  }

  for (const row of rows) {
    if (row.kind !== 'profile') continue
    const children = rows.filter(
      (r) =>
        r.kind === 'employee' &&
        r.phaseId === row.phaseId &&
        r.taskId === row.taskId &&
        r.profileId === row.profileId,
    )
    const tcAmount = children.reduce((s, r) => s + (result.get(r.id)?.tcAmount ?? 0), 0)
    const sellRate = row.forecastSellRate ?? 0
    const trAmount = row.quotedDays * sellRate
    const trMargin = trAmount - tcAmount

    const periodDays = sumCells(row.cells)
    const pcAmount = children.reduce((s, r) => s + (result.get(r.id)?.pcAmount ?? 0), 0)

    // Period revenue: delta of remaining days (RAF) since the previous
    // snapshot, valued at the validated sell rate. The first consolidated
    // period has no prior snapshot — quotedDays acts as the baseline RAF.
    let prDaysProduced: number
    if (useRafDeltaRevenue && row.taskId && row.profileId) {
      const key = `${row.taskId}::${row.profileId}`
      const prevRaf = prevRafMap.get(key) ?? row.quotedDays
      prDaysProduced = Math.max(0, prevRaf - row.totalRemaining)
    } else {
      prDaysProduced = periodDays
    }
    const prAmount = prDaysProduced * sellRate
    const prMargin = prAmount - pcAmount

    result.set(row.id, {
      tcDaysSpent: row.totalActual,
      tcDaysRemaining: row.totalRemaining,
      tcTotalDays: row.total,
      tcAmount,
      trDaysSold: row.quotedDays,
      trDailyRate: sellRate || null,
      trAmount,
      trMargin,
      trMarginPct: trAmount !== 0 ? (trMargin / trAmount) * 100 : null,
      pcDaysSpent: periodDays,
      pcDailyCost: periodDays > 0 ? pcAmount / periodDays : null,
      pcAmount,
      prDaysProduced,
      prAmount,
      prMargin,
      prMarginPct: prAmount !== 0 ? (prMargin / prAmount) * 100 : null,
    })
  }

  for (const row of rows) {
    if (row.kind !== 'task') continue
    const children = rows.filter(
      (r) => r.kind === 'profile' && r.phaseId === row.phaseId && r.taskId === row.taskId,
    )
    result.set(row.id, aggregateFrozen(children, result))
  }

  for (const row of rows) {
    if (row.kind !== 'phase') continue
    const children = rows.filter((r) => r.kind === 'task' && r.phaseId === row.phaseId)
    result.set(row.id, aggregateFrozen(children, result))
  }

  for (const row of rows) {
    if (row.kind !== 'grand-total') continue
    const phases = rows.filter((r) => r.kind === 'phase')
    result.set(row.id, aggregateFrozen(phases, result))
  }

  return result
}

export function getFrozenValue(fd: FrozenData, key: string): number | null {
  switch (key) {
    case 'tc_spent':
      return fd.tcDaysSpent
    case 'tc_rem':
      return fd.tcDaysRemaining
    case 'tc_total':
      return fd.tcTotalDays
    case 'tc_amount':
      return fd.tcAmount
    case 'tr_sold':
      return fd.trDaysSold
    case 'tr_rate':
      return fd.trDailyRate
    case 'tr_amount':
      return fd.trAmount
    case 'tr_margin':
      return fd.trMargin
    case 'pc_spent':
      return fd.pcDaysSpent
    case 'pc_cost':
      return fd.pcDailyCost
    case 'pc_amount':
      return fd.pcAmount
    case 'pr_produced':
      return fd.prDaysProduced
    case 'pr_amount':
      return fd.prAmount
    case 'pr_margin':
      return fd.prMargin
    default:
      return null
  }
}

export function getFrozenMarginPct(fd: FrozenData, key: string): number | null {
  if (key === 'tr_margin') return fd.trMarginPct
  if (key === 'pr_margin') return fd.prMarginPct
  return null
}

export function formatFrozenValue(value: number | null, format: FrozenColDef['format']): string {
  if (value === null) return '—'
  switch (format) {
    case 'days':
      return value === 0 ? '0' : formatDays(value)
    case 'currency':
    case 'rate':
    case 'margin':
      return formatCurrency(value)
  }
}

/** Columns whose data lives at profile-level and is N/A on employee rows. */
const EMPLOYEE_NA_COLS = new Set([
  'tr_sold',
  'tr_rate',
  'tr_amount',
  'tr_margin',
])

export function isFrozenColApplicable(rowKind: GridRow['kind'], colKey: string): boolean {
  if (rowKind === 'employee') return !EMPLOYEE_NA_COLS.has(colKey)
  return true
}
