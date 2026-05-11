import type { Employee, Phase, PeriodInfo, Profile, Quote, Task, WorkTableCell } from '@/api/types'
import type { GridRow } from '@/lib/work-table/types'

interface PeriodStatusIndex {
  frozen: Set<string>
  consolidation: Set<string>
}

function indexPeriodStatuses(periods: PeriodInfo[]): PeriodStatusIndex {
  const frozen = new Set<string>()
  const consolidation = new Set<string>()
  for (const p of periods) {
    if (p.status === 'FROZEN') frozen.add(p.periodKey)
    else if (p.status === 'CONSOLIDATION') consolidation.add(p.periodKey)
  }
  return { frozen, consolidation }
}

interface CellSplit {
  validatedDaysSpent: number  // FROZEN
  daysInConsolidation: number // CONSOLIDATION
  totalRemaining: number      // OPEN + FUTURE
}

function splitCellsByStatus(
  cells: Record<string, number>,
  index: PeriodStatusIndex,
): CellSplit {
  let validatedDaysSpent = 0
  let daysInConsolidation = 0
  let totalRemaining = 0
  for (const [periodKey, days] of Object.entries(cells)) {
    if (index.frozen.has(periodKey)) validatedDaysSpent += days
    else if (index.consolidation.has(periodKey)) daysInConsolidation += days
    else totalRemaining += days
  }
  return { validatedDaysSpent, daysInConsolidation, totalRemaining }
}

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const item of items) map.set(item.id, item)
  return map
}

function findValidatedQuoteLines(
  taskId: string,
  profileId: string,
  quotes: Quote[],
): { totalDays: number; sellRatePerDay: number | null } {
  let totalDays = 0
  let sellRatePerDay: number | null = null
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      if (line.taskId === taskId && line.profileId === profileId) {
        totalDays += line.days
        if (sellRatePerDay === null) sellRatePerDay = line.sellRatePerDay
      }
    }
  }
  return { totalDays, sellRatePerDay }
}

interface QuoteContribution {
  quoteId: string
  quoteTitle: string
  days: number
  revenue: number
  cost: number
}

function buildQuoteContributionsForTask(taskId: string, quotes: Quote[]): QuoteContribution[] {
  const byQuote = new Map<string, QuoteContribution>()
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      if (line.taskId !== taskId) continue
      const existing = byQuote.get(quote.id)
      if (existing) {
        existing.days += line.days
        existing.revenue += line.revenueAmount
        existing.cost += line.budgetCostAmount
      } else {
        byQuote.set(quote.id, {
          quoteId: quote.id,
          quoteTitle: quote.title,
          days: line.days,
          revenue: line.revenueAmount,
          cost: line.budgetCostAmount,
        })
      }
    }
  }
  return [...byQuote.values()]
}

function mergeCells(...cellMaps: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const map of cellMaps) {
    for (const [periodKey, days] of Object.entries(map)) {
      result[periodKey] = (result[periodKey] ?? 0) + days
    }
  }
  return result
}

export function buildGridRows(
  workTable: WorkTableCell[],
  periods: PeriodInfo[],
  phases: Phase[],
  quotes: Quote[],
  profiles: Profile[],
  employees: Employee[],
): GridRow[] {
  const periodStatusIndex = indexPeriodStatuses(periods)
  const flatTasks: Task[] = phases.flatMap(p => p.tasks)
  const taskMap = indexById(flatTasks)
  const phaseMap = indexById(phases)
  const profileMap = indexById(profiles)
  const employeeMap = indexById(employees)

  function getPhaseId(taskId: string): string | null {
    return taskMap.get(taskId)?.phaseId ?? null
  }

  type EmployeeKey = string
  type CellsMap = Record<string, number>

  const phaseOrder: string[] = []
  const phaseGrouping = new Map<
    string,
    {
      task: Map<
        string,
        {
          profileMap: Map<
            string,
            {
              employeeMap: Map<EmployeeKey, CellsMap>
            }
          >
        }
      >
    }
  >()

  for (const cell of workTable) {
    const phaseId = getPhaseId(cell.taskId)
    if (!phaseId) continue

    if (!phaseGrouping.has(phaseId)) {
      phaseGrouping.set(phaseId, { task: new Map() })
      phaseOrder.push(phaseId)
    }
    const phaseEntry = phaseGrouping.get(phaseId)!

    if (!phaseEntry.task.has(cell.taskId)) {
      phaseEntry.task.set(cell.taskId, { profileMap: new Map() })
    }
    const taskEntry = phaseEntry.task.get(cell.taskId)!

    if (!taskEntry.profileMap.has(cell.profileId)) {
      taskEntry.profileMap.set(cell.profileId, { employeeMap: new Map() })
    }
    const profileEntry = taskEntry.profileMap.get(cell.profileId)!

    const empKey = cell.employeeId ?? 'UNASSIGNED'
    if (!profileEntry.employeeMap.has(empKey)) {
      profileEntry.employeeMap.set(empKey, {})
    }
    const empCells = profileEntry.employeeMap.get(empKey)!
    empCells[cell.periodKey] = (empCells[cell.periodKey] ?? 0) + cell.days
  }

  // Seed all phases and their tasks so they appear even with no quote lines or cells.
  for (const phase of phases) {
    if (!phaseGrouping.has(phase.id)) {
      phaseGrouping.set(phase.id, { task: new Map() })
      phaseOrder.push(phase.id)
    }
    const phaseEntry = phaseGrouping.get(phase.id)!
    for (const task of phase.tasks) {
      if (!phaseEntry.task.has(task.id)) {
        phaseEntry.task.set(task.id, { profileMap: new Map() })
      }
    }
  }

  // Seed rows for all validated quote-line (task, profile) combos that have no cells yet.
  // This allows planners to enter days even on a fresh project with no allocations.
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      const { taskId, profileId } = line
      const phaseId = getPhaseId(taskId)
      if (!phaseId) continue

      if (!phaseGrouping.has(phaseId)) {
        phaseGrouping.set(phaseId, { task: new Map() })
        phaseOrder.push(phaseId)
      }
      const phaseEntry = phaseGrouping.get(phaseId)!

      if (!phaseEntry.task.has(taskId)) {
        phaseEntry.task.set(taskId, { profileMap: new Map() })
      }
      const taskEntry = phaseEntry.task.get(taskId)!

      if (!taskEntry.profileMap.has(profileId)) {
        taskEntry.profileMap.set(profileId, { employeeMap: new Map() })
      }
      const profileEntry = taskEntry.profileMap.get(profileId)!

      // Ensure at least an UNASSIGNED employee row exists, but only when no named
      // employee is already assigned — otherwise the assigned row is the editable entry.
      const hasNamedEmployee = [...profileEntry.employeeMap.keys()].some((k) => k !== 'UNASSIGNED')
      if (!hasNamedEmployee && !profileEntry.employeeMap.has('UNASSIGNED')) {
        profileEntry.employeeMap.set('UNASSIGNED', {})
      }
    }
  }

  function makeSummary(
    cells: Record<string, number>,
    taskId: string | undefined,
    profileId: string | undefined,
    employeeId: string | null | undefined,
  ) {
    const split = splitCellsByStatus(cells, periodStatusIndex)
    const { validatedDaysSpent, daysInConsolidation, totalRemaining } = split
    const totalActual = validatedDaysSpent + daysInConsolidation
    const total = totalActual + totalRemaining

    const isEmployeeLevel = employeeId !== undefined
    let quotedDays = 0
    let forecastSellRate: number | null = null
    if (taskId && profileId && !isEmployeeLevel) {
      const ql = findValidatedQuoteLines(taskId, profileId, quotes)
      quotedDays = ql.totalDays
      forecastSellRate = ql.sellRatePerDay
    }
    const variance = !isEmployeeLevel ? total - quotedDays : 0
    // Days quoted but not yet allocated into period cells. Surfaces newly
    // validated quotes mid-project: their days inflate quotedDays without
    // touching cells, so toPlan rises until the planner redistributes them.
    const toPlan = !isEmployeeLevel ? Math.max(0, quotedDays - total) : 0

    let forecastCostRate: number | null = null
    if (employeeId !== undefined) {
      if (employeeId === null || employeeId === 'UNASSIGNED') {
        if (profileId) {
          forecastCostRate = profileMap.get(profileId)?.defaultCostRatePerDay ?? null
        }
      } else {
        forecastCostRate = employeeMap.get(employeeId)?.currentCostRatePerDay ?? null
      }
    }

    const etcCost = forecastCostRate !== null ? totalRemaining * forecastCostRate : null

    return {
      totalActual,
      totalRemaining,
      total,
      validatedDaysSpent,
      daysInConsolidation,
      quotedDays,
      variance,
      toPlan,
      forecastCostRate,
      forecastSellRate,
      etcCost,
    }
  }

  const rows: GridRow[] = []
  const grandTotalCells: Record<string, number> = {}

  for (const phaseId of phaseOrder) {
    const phaseEntry = phaseGrouping.get(phaseId)!
    const phaseDef = phaseMap.get(phaseId)
    const phaseCellsList: Record<string, number>[] = []

    for (const [taskId, taskEntry] of phaseEntry.task) {
      const taskCellsList: Record<string, number>[] = []

      for (const [profileId, profileEntry] of taskEntry.profileMap) {
        const profileCellsList: Record<string, number>[] = []

        for (const [empKey, empCells] of profileEntry.employeeMap) {
          const employeeId = empKey === 'UNASSIGNED' ? null : empKey
          const summary = makeSummary(empCells, taskId, profileId, employeeId)

          rows.push({
            id: `emp-${phaseId}-${taskId}-${profileId}-${empKey}`,
            kind: 'employee',
            phaseId,
            taskId,
            profileId,
            employeeId,
            label: employeeId
              ? (employeeMap.get(employeeId)?.name ?? employeeId)
              : 'UNASSIGNED',
            depth: 3,
            cells: { ...empCells },
            ...summary,
          })
          profileCellsList.push(empCells)
        }

        const profCells = mergeCells(...profileCellsList)
        const profileSummary = makeSummary(profCells, taskId, profileId, undefined)

        rows.push({
          id: `prof-${phaseId}-${taskId}-${profileId}`,
          kind: 'profile',
          phaseId,
          taskId,
          profileId,
          label: profileMap.get(profileId)?.name ?? profileId,
          depth: 2,
          cells: profCells,
          ...profileSummary,
        })
        taskCellsList.push(profCells)
      }

      const taskCells = mergeCells(...taskCellsList)
      const taskSummary = makeSummary(taskCells, taskId, undefined, undefined)
      const taskDef = taskMap.get(taskId)

      rows.push({
        id: `task-${phaseId}-${taskId}`,
        kind: 'task',
        phaseId,
        taskId,
        label: taskDef?.name ?? taskId,
        depth: 1,
        cells: taskCells,
        ...taskSummary,
      })

      // Quote contribution sub-rows: one per validated quote that touches this task.
      // They sit between the task row and its profile rows in the rendered order.
      // No period cells (commercial layer, not planning).
      for (const contrib of buildQuoteContributionsForTask(taskId, quotes)) {
        rows.push({
          id: `quote-${phaseId}-${taskId}-${contrib.quoteId}`,
          kind: 'quote',
          phaseId,
          taskId,
          quoteId: contrib.quoteId,
          label: contrib.quoteTitle,
          depth: 2,
          cells: {},
          totalActual: 0,
          totalRemaining: 0,
          total: 0,
          validatedDaysSpent: 0,
          daysInConsolidation: 0,
          quotedDays: contrib.days,
          variance: 0,
          toPlan: 0,
          forecastCostRate: null,
          forecastSellRate: null,
          etcCost: null,
          quoteRevenue: contrib.revenue,
          quoteCost: contrib.cost,
        })
      }

      phaseCellsList.push(taskCells)
    }

    const phaseCells = mergeCells(...phaseCellsList)
    const phaseSummary = makeSummary(phaseCells, undefined, undefined, undefined)

    rows.push({
      id: `phase-${phaseId}`,
      kind: 'phase',
      phaseId,
      label: phaseDef?.name ?? phaseId,
      depth: 0,
      cells: phaseCells,
      ...phaseSummary,
    })

    for (const [periodKey, days] of Object.entries(phaseCells)) {
      grandTotalCells[periodKey] = (grandTotalCells[periodKey] ?? 0) + days
    }
  }

  // Build ordered rows by phase/task/profile/employee.
  const orderedRows: GridRow[] = []
  const rowById = new Map<string, GridRow>()
  for (const r of rows) rowById.set(r.id, r)

  for (const phaseId of phaseOrder) {
    const phaseRow = rowById.get(`phase-${phaseId}`)
    if (phaseRow) orderedRows.push(phaseRow)

    const phaseEntry = phaseGrouping.get(phaseId)!
    const taskIds = [...phaseEntry.task.keys()]
    taskIds.sort((a, b) => {
      const sortA = taskMap.get(a)?.sortOrder ?? 99
      const sortB = taskMap.get(b)?.sortOrder ?? 99
      return sortA - sortB
    })

    for (const taskId of taskIds) {
      const taskRow = rowById.get(`task-${phaseId}-${taskId}`)
      if (taskRow) orderedRows.push(taskRow)

      // Emit quote contribution rows for this task before the profile rows.
      for (const r of rows) {
        if (r.kind === 'quote' && r.phaseId === phaseId && r.taskId === taskId) {
          orderedRows.push(r)
        }
      }

      const taskEntry = phaseEntry.task.get(taskId)!
      for (const profileId of taskEntry.profileMap.keys()) {
        const profileRow = rowById.get(`prof-${phaseId}-${taskId}-${profileId}`)
        if (profileRow) orderedRows.push(profileRow)

        const profileEntry = taskEntry.profileMap.get(profileId)!
        for (const empKey of profileEntry.employeeMap.keys()) {
          const employeeRow = rowById.get(`emp-${phaseId}-${taskId}-${profileId}-${empKey}`)
          if (employeeRow) orderedRows.push(employeeRow)
        }
      }
    }
  }

  const grandSplit = splitCellsByStatus(grandTotalCells, periodStatusIndex)
  const grandTotalActual = grandSplit.validatedDaysSpent + grandSplit.daysInConsolidation

  orderedRows.push({
    id: 'grand-total',
    kind: 'grand-total',
    phaseId: '',
    label: 'Grand Total',
    depth: 0,
    cells: grandTotalCells,
    totalActual: grandTotalActual,
    totalRemaining: grandSplit.totalRemaining,
    total: grandTotalActual + grandSplit.totalRemaining,
    validatedDaysSpent: grandSplit.validatedDaysSpent,
    daysInConsolidation: grandSplit.daysInConsolidation,
    quotedDays: 0,
    variance: 0,
    toPlan: 0,
    forecastCostRate: null,
    forecastSellRate: null,
    etcCost: null,
  })

  return orderedRows
}