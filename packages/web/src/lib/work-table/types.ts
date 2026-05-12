export type RowKind = 'phase' | 'task' | 'quote' | 'profile' | 'employee' | 'grand-total'

export interface GridRow {
  id: string
  kind: RowKind
  phaseId: string
  taskId?: string
  /** Set on rows of kind 'quote'. */
  quoteId?: string
  profileId?: string
  employeeId?: string | null
  label: string
  depth: number
  cells: Record<string, number>
  /** Per-row set of periodKeys whose value came from declared TaskTimesheets
   *  rather than PlannedDays. Used by the cell renderer to visually
   *  differentiate actuals from plan. */
  actualPeriods?: Set<string>
  /** FROZEN + CONSOLIDATION cells (legacy "spent"). */
  totalActual: number
  /** OPEN + FUTURE cells. */
  totalRemaining: number
  /** Σ(cells). */
  total: number
  /** FROZEN cells only — days locked in past snapshots. */
  validatedDaysSpent: number
  /** CONSOLIDATION cells — days awaiting current period close. */
  daysInConsolidation: number
  /** Σ days from VALIDATED quote lines for this (task, profile). */
  quotedDays: number
  /** total - quotedDays (negative = under-planned). */
  variance: number
  /** max(0, quotedDays - total) — quoted days not yet redistributed into period cells. */
  toPlan: number
  forecastCostRate: number | null
  forecastSellRate: number | null
  etcCost: number | null
  /** For quote-kind rows: revenue contribution from this quote on the parent task. */
  quoteRevenue?: number
  /** For quote-kind rows: budgeted cost contribution from this quote on the parent task. */
  quoteCost?: number
}

export interface FrozenData {
  tcDaysSpent: number
  tcDaysRemaining: number
  tcTotalDays: number
  tcAmount: number
  trDaysSold: number
  trDailyRate: number | null
  trAmount: number
  trMargin: number
  trMarginPct: number | null
  pcDaysSpent: number
  pcDailyCost: number | null
  pcAmount: number
  prDaysProduced: number
  prAmount: number
  prMargin: number
  prMarginPct: number | null
}

export interface MarginInsightEmployee {
  employeeId: string
  employeeName: string
  profileId: string
  profileName: string
  remainingDays: number
  actualCostRate: number
  assumedCostRate: number
  rateImpact: number
  totalImpact: number
  etcCost: number
}
