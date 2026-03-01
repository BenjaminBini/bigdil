export type RowKind = 'phase' | 'task' | 'profile' | 'employee' | 'grand-total'

export interface GridRow {
  id: string
  kind: RowKind
  phaseId: string
  taskId?: string
  profileId?: string
  employeeId?: string | null
  label: string
  depth: number
  cells: Record<string, number>
  totalActual: number
  totalRemaining: number
  total: number
  quotedDays: number
  variance: number
  forecastCostRate: number | null
  forecastSellRate: number | null
  etcCost: number | null
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
