import { prisma } from '@bigdil/db'
import { comparePeriodCodes, parsePeriodSliceKey } from './period-utils.js'

// Period filter helpers ─────────────────────────────────────────────────────

export function periodKeyMatchesMonth(periodKey: string, monthCode: string): boolean {
  if (periodKey === monthCode) return true
  return periodKey.startsWith(`${monthCode}__`)
}

export function periodKeyOnOrBeforeMonth(periodKey: string, monthCode: string): boolean {
  const { monthCode: m } = parsePeriodSliceKey(periodKey)
  return comparePeriodCodes(m, monthCode) <= 0
}

export function periodKeyAfterMonth(periodKey: string, monthCode: string): boolean {
  const { monthCode: m } = parsePeriodSliceKey(periodKey)
  return comparePeriodCodes(m, monthCode) > 0
}

// Inputs assembled once and reused across the three builders so we only hit
// the database in one batch.
export interface SnapshotInputs {
  projectId: string
  monthCode: string
  validatedQuoteLines: Array<{
    taskId: string
    profileId: string
    days: number
    sellRatePerDay: number
    costRateAssumptionPerDay: number
    revenueAmount: number
    budgetCostAmount: number
  }>
  plannedDays: Array<{
    periodKey: string
    days: number
    assignmentSlot: { projectId: string; taskId: string; profileId: string; employeeId: string | null }
  }>
  taskTimesheets: Array<{
    days: number
    appliedCostAmount: number | null
    appliedSellAmount: number | null
    timesheet: { periodKey: string; status: string }
    assignmentSlot: { projectId: string; taskId: string; profileId: string; employeeId: string | null }
  }>
}

export async function loadSnapshotInputs(projectId: string, monthCode: string): Promise<SnapshotInputs> {
  const [validatedQuotes, plannedDays, taskTimesheets] = await Promise.all([
    prisma.quote.findMany({
      where: { projectId, status: 'VALIDATED' },
      include: { lines: true },
    }),
    prisma.plannedDay.findMany({
      where: { assignmentSlot: { projectId } },
      include: {
        assignmentSlot: {
          select: { projectId: true, taskId: true, profileId: true, employeeId: true },
        },
      },
    }),
    prisma.taskTimesheet.findMany({
      where: { assignmentSlot: { projectId } },
      include: {
        timesheet: { select: { periodKey: true, status: true } },
        assignmentSlot: {
          select: { projectId: true, taskId: true, profileId: true, employeeId: true },
        },
      },
    }),
  ])

  const validatedQuoteLines = validatedQuotes.flatMap((q) => q.lines)

  return {
    projectId,
    monthCode,
    validatedQuoteLines,
    plannedDays,
    taskTimesheets,
  }
}

// Metrics ──────────────────────────────────────────────────────────────────
// Defensible defaults — refine later as accounting rules harden.
//
//   contractValue                 = Σ revenueAmount on VALIDATED quote lines
//   actualCostToDate              = Σ appliedCostAmount on APPROVED entries
//                                   in periods on or before monthCode
//   etcCost                       = Σ plannedDays * costRateAssumption from
//                                   the validated quote, for periods strictly
//                                   AFTER monthCode (estimate-to-complete)
//   eacCost                       = actualCostToDate + etcCost
//   marginForecast                = contractValue - eacCost
//   executedDaysPeriod            = Σ days on APPROVED entries during monthCode
//   producedExecutionValuePeriod  = Σ appliedSellAmount during monthCode
//   producedExecutionValueToDate  = Σ appliedSellAmount up to and including
//                                   monthCode
//   netBurnValuePeriod            = producedExecutionValuePeriod − costPeriod
//                                   (margin produced this month)
export interface SnapshotMetricsValues {
  contractValue: number
  actualCostToDate: number
  etcCost: number
  eacCost: number
  marginForecast: number
  executedDaysPeriod: number
  producedExecutionValuePeriod: number
  producedExecutionValueToDate: number
  netBurnValuePeriod: number
}

function costRateLookup(inputs: SnapshotInputs): Map<string, number> {
  const map = new Map<string, number>()
  for (const line of inputs.validatedQuoteLines) {
    map.set(`${line.taskId}::${line.profileId}`, line.costRateAssumptionPerDay)
  }
  return map
}

export function computeSnapshotMetrics(inputs: SnapshotInputs): SnapshotMetricsValues {
  const contractValue = inputs.validatedQuoteLines.reduce((sum, l) => sum + l.revenueAmount, 0)

  let actualCostToDate = 0
  let executedDaysPeriod = 0
  let producedExecutionValuePeriod = 0
  let producedExecutionValueToDate = 0
  let costPeriod = 0

  for (const t of inputs.taskTimesheets) {
    if (t.timesheet.status !== 'APPROVED') continue
    const inMonth = periodKeyMatchesMonth(t.timesheet.periodKey, inputs.monthCode)
    const onOrBefore = periodKeyOnOrBeforeMonth(t.timesheet.periodKey, inputs.monthCode)

    if (onOrBefore) {
      actualCostToDate += t.appliedCostAmount ?? 0
      producedExecutionValueToDate += t.appliedSellAmount ?? 0
    }
    if (inMonth) {
      executedDaysPeriod += t.days
      producedExecutionValuePeriod += t.appliedSellAmount ?? 0
      costPeriod += t.appliedCostAmount ?? 0
    }
  }

  const costRates = costRateLookup(inputs)
  let etcCost = 0
  for (const pd of inputs.plannedDays) {
    if (!periodKeyAfterMonth(pd.periodKey, inputs.monthCode)) continue
    const rate = costRates.get(`${pd.assignmentSlot.taskId}::${pd.assignmentSlot.profileId}`) ?? 0
    etcCost += pd.days * rate
  }

  const eacCost = actualCostToDate + etcCost
  const marginForecast = contractValue - eacCost
  const netBurnValuePeriod = producedExecutionValuePeriod - costPeriod

  return {
    contractValue,
    actualCostToDate,
    etcCost,
    eacCost,
    marginForecast,
    executedDaysPeriod,
    producedExecutionValuePeriod,
    producedExecutionValueToDate,
    netBurnValuePeriod,
  }
}

// Scope lines ──────────────────────────────────────────────────────────────
// One row per (taskId, profileId) aggregated from VALIDATED quotes.
// Captures what was contractually scoped at the moment of snapshot.
export interface SnapshotScopeLineValues {
  taskId: string
  profileId: string
  baselineDaysTotalAsofSnapshot: number
  sellRatePerDay: number
  costRateAssumptionPerDay: number
  baselineRevenueTotal: number
  baselineBudgetCostTotal: number
}

export function buildScopeLines(inputs: SnapshotInputs): SnapshotScopeLineValues[] {
  const acc = new Map<string, SnapshotScopeLineValues>()
  for (const line of inputs.validatedQuoteLines) {
    const key = `${line.taskId}::${line.profileId}`
    const existing = acc.get(key)
    if (existing) {
      existing.baselineDaysTotalAsofSnapshot += line.days
      existing.baselineRevenueTotal += line.revenueAmount
      existing.baselineBudgetCostTotal += line.budgetCostAmount
      continue
    }
    acc.set(key, {
      taskId: line.taskId,
      profileId: line.profileId,
      baselineDaysTotalAsofSnapshot: line.days,
      sellRatePerDay: line.sellRatePerDay,
      costRateAssumptionPerDay: line.costRateAssumptionPerDay,
      baselineRevenueTotal: line.revenueAmount,
      baselineBudgetCostTotal: line.budgetCostAmount,
    })
  }
  return [...acc.values()]
}

// Work rows ────────────────────────────────────────────────────────────────
// Per (periodKey, taskId, profileId, employeeId?) within the project's known
// periods. Combines planned days with actual days from approved timesheets,
// freezing the period status at snapshot moment.
export interface SnapshotWorkRowValues {
  periodKey: string
  periodStatus: 'FROZEN' | 'CONSOLIDATION' | 'OPEN' | 'FUTURE'
  taskId: string
  profileId: string
  employeeId: string | null
  plannedDays: number
  actualDays: number | null
}

export function buildWorkRows(
  inputs: SnapshotInputs,
  derivePeriodStatus: (periodKey: string) => 'FROZEN' | 'CONSOLIDATION' | 'OPEN' | 'FUTURE',
): SnapshotWorkRowValues[] {
  const acc = new Map<string, SnapshotWorkRowValues>()

  function key(periodKey: string, taskId: string, profileId: string, employeeId: string | null): string {
    return `${periodKey}::${taskId}::${profileId}::${employeeId ?? 'NULL'}`
  }

  for (const pd of inputs.plannedDays) {
    const k = key(pd.periodKey, pd.assignmentSlot.taskId, pd.assignmentSlot.profileId, pd.assignmentSlot.employeeId)
    const existing = acc.get(k)
    if (existing) {
      existing.plannedDays += pd.days
      continue
    }
    acc.set(k, {
      periodKey: pd.periodKey,
      periodStatus: derivePeriodStatus(pd.periodKey),
      taskId: pd.assignmentSlot.taskId,
      profileId: pd.assignmentSlot.profileId,
      employeeId: pd.assignmentSlot.employeeId,
      plannedDays: pd.days,
      actualDays: null,
    })
  }

  for (const t of inputs.taskTimesheets) {
    if (t.timesheet.status !== 'APPROVED') continue
    const k = key(t.timesheet.periodKey, t.assignmentSlot.taskId, t.assignmentSlot.profileId, t.assignmentSlot.employeeId)
    const existing = acc.get(k)
    if (existing) {
      existing.actualDays = (existing.actualDays ?? 0) + t.days
      continue
    }
    acc.set(k, {
      periodKey: t.timesheet.periodKey,
      periodStatus: derivePeriodStatus(t.timesheet.periodKey),
      taskId: t.assignmentSlot.taskId,
      profileId: t.assignmentSlot.profileId,
      employeeId: t.assignmentSlot.employeeId,
      plannedDays: 0,
      actualDays: t.days,
    })
  }

  return [...acc.values()]
}
