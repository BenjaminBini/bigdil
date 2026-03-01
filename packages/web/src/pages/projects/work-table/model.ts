import type { Employee, Period, Profile, Quote, Task, WorkTableCell } from '@/api/types'
import type { GridRow, MarginInsightEmployee } from './types'

function getQuotedDays(taskId: string, profileId: string, quotes: Quote[]): number {
  let total = 0
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      if (line.taskId === taskId && line.profileId === profileId) {
        total += line.days
      }
    }
  }
  return total
}

function getFrozenSellRate(taskId: string, profileId: string, quotes: Quote[]): number | null {
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      if (line.taskId === taskId && line.profileId === profileId) {
        return line.sellRatePerDay
      }
    }
  }
  return null
}

export function buildGridRows(
  workTable: WorkTableCell[],
  periods: Period[],
  flatTasks: Task[],
  quotes: Quote[],
  profiles: Profile[],
  employees: Employee[],
): GridRow[] {
  const closedPeriodIds = new Set(
    periods.filter((p) => p.status === 'FROZEN' || p.status === 'CONSOLIDATION').map((p) => p.id),
  )

  function getProfile(profileId: string) {
    return profiles.find((p) => p.id === profileId)
  }

  function getEmployee(employeeId: string | null) {
    if (!employeeId) return null
    return employees.find((e) => e.id === employeeId)
  }

  function getPhase(taskId: string): Task | null {
    const task = flatTasks.find((t) => t.id === taskId)
    if (!task) return null
    if (!task.parentTaskId) return task
    return flatTasks.find((t) => t.id === task.parentTaskId) ?? null
  }

  type EmployeeKey = string
  type CellsMap = Record<string, number>

  const phaseOrder: string[] = []
  const phaseMap = new Map<
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
    const phase = getPhase(cell.taskId)
    if (!phase) continue
    const phaseId = phase.id

    if (!phaseMap.has(phaseId)) {
      phaseMap.set(phaseId, { task: new Map() })
      phaseOrder.push(phaseId)
    }
    const phaseEntry = phaseMap.get(phaseId)!

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
    empCells[cell.periodId] = (empCells[cell.periodId] ?? 0) + cell.days
  }

  const rows: GridRow[] = []

  function makeSummary(
    cells: Record<string, number>,
    taskId: string | undefined,
    profileId: string | undefined,
    employeeId: string | null | undefined,
  ) {
    const totalActual = Object.entries(cells)
      .filter(([pid]) => closedPeriodIds.has(pid))
      .reduce((s, [, d]) => s + d, 0)
    const totalRemaining = Object.entries(cells)
      .filter(([pid]) => !closedPeriodIds.has(pid))
      .reduce((s, [, d]) => s + d, 0)
    const total = totalActual + totalRemaining

    const isEmployeeLevel = employeeId !== undefined
    let quotedDays = 0
    let forecastSellRate: number | null = null
    if (taskId && profileId && !isEmployeeLevel) {
      quotedDays = getQuotedDays(taskId, profileId, quotes)
      forecastSellRate = getFrozenSellRate(taskId, profileId, quotes)
    }
    const variance = !isEmployeeLevel ? total - quotedDays : 0

    let forecastCostRate: number | null = null
    if (employeeId !== undefined) {
      if (employeeId === null || employeeId === 'UNASSIGNED') {
        if (profileId) {
          forecastCostRate = getProfile(profileId)?.defaultCostRatePerDay ?? null
        }
      } else {
        forecastCostRate = getEmployee(employeeId)?.currentCostRatePerDay ?? null
      }
    }

    const etcCost = forecastCostRate !== null ? totalRemaining * forecastCostRate : null

    return {
      totalActual,
      totalRemaining,
      total,
      quotedDays,
      variance,
      forecastCostRate,
      forecastSellRate,
      etcCost,
    }
  }

  function mergeCells(...cellMaps: Record<string, number>[]): Record<string, number> {
    const result: Record<string, number> = {}
    for (const m of cellMaps) {
      for (const [pid, days] of Object.entries(m)) {
        result[pid] = (result[pid] ?? 0) + days
      }
    }
    return result
  }

  const grandTotalCells: Record<string, number> = {}

  for (const phaseId of phaseOrder) {
    const phaseEntry = phaseMap.get(phaseId)!
    const phaseDef = flatTasks.find((t) => t.id === phaseId)
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
            label: employeeId ? (getEmployee(employeeId)?.name ?? employeeId) : 'UNASSIGNED',
            depth: 3,
            cells: { ...empCells },
            ...summary,
          })
          profileCellsList.push(empCells)
        }

        const profileCells = mergeCells(...profileCellsList)
        const profileSummary = makeSummary(profileCells, taskId, profileId, undefined)

        rows.push({
          id: `prof-${phaseId}-${taskId}-${profileId}`,
          kind: 'profile',
          phaseId,
          taskId,
          profileId,
          label: getProfile(profileId)?.name ?? profileId,
          depth: 2,
          cells: profileCells,
          ...profileSummary,
        })
        taskCellsList.push(profileCells)
      }

      const taskCells = mergeCells(...taskCellsList)
      const taskSummary = makeSummary(taskCells, taskId, undefined, undefined)
      const taskDef = flatTasks.find((t) => t.id === taskId)

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

    for (const [pid, days] of Object.entries(phaseCells)) {
      grandTotalCells[pid] = (grandTotalCells[pid] ?? 0) + days
    }
  }

  const orderedRows: GridRow[] = []

  for (const phaseId of phaseOrder) {
    const phaseRow = rows.find((r) => r.kind === 'phase' && r.phaseId === phaseId)
    if (!phaseRow) continue
    orderedRows.push(phaseRow)

    const phaseEntry = phaseMap.get(phaseId)!
    const taskIds = [...phaseEntry.task.keys()]
    taskIds.sort((a, b) => {
      const ta = flatTasks.find((t) => t.id === a)?.sortOrder ?? 99
      const tb = flatTasks.find((t) => t.id === b)?.sortOrder ?? 99
      return ta - tb
    })

    for (const taskId of taskIds) {
      const taskRow = rows.find(
        (r) => r.kind === 'task' && r.taskId === taskId && r.phaseId === phaseId,
      )
      if (taskRow) orderedRows.push(taskRow)

      const taskEntry = phaseEntry.task.get(taskId)!
      for (const profileId of taskEntry.profileMap.keys()) {
        const profileRow = rows.find(
          (r) =>
            r.kind === 'profile' &&
            r.taskId === taskId &&
            r.profileId === profileId &&
            r.phaseId === phaseId,
        )
        if (profileRow) orderedRows.push(profileRow)

        const profileEntry = taskEntry.profileMap.get(profileId)!
        for (const empKey of profileEntry.employeeMap.keys()) {
          const empRow = rows.find(
            (r) =>
              r.kind === 'employee' &&
              r.taskId === taskId &&
              r.profileId === profileId &&
              r.phaseId === phaseId &&
              (r.employeeId ?? 'UNASSIGNED') === empKey,
          )
          if (empRow) orderedRows.push(empRow)
        }
      }
    }
  }

  const gtActual = Object.entries(grandTotalCells)
    .filter(([pid]) => closedPeriodIds.has(pid))
    .reduce((s, [, d]) => s + d, 0)
  const gtRemaining = Object.entries(grandTotalCells)
    .filter(([pid]) => !closedPeriodIds.has(pid))
    .reduce((s, [, d]) => s + d, 0)

  orderedRows.push({
    id: 'grand-total',
    kind: 'grand-total',
    phaseId: '',
    label: 'Grand Total',
    depth: 0,
    cells: grandTotalCells,
    totalActual: gtActual,
    totalRemaining: gtRemaining,
    total: gtActual + gtRemaining,
    quotedDays: 0,
    variance: 0,
    forecastCostRate: null,
    forecastSellRate: null,
    etcCost: null,
  })

  return orderedRows
}

export function computeColumnTotals(
  rows: GridRow[],
  periods: Period[],
): {
  byCellPeriod: Record<string, number>
  totalActual: number
  totalRemaining: number
  total: number
} {
  const leafRows = rows.filter((r) => r.kind === 'employee')

  const byCellPeriod: Record<string, number> = {}
  for (const row of leafRows) {
    for (const [pid, days] of Object.entries(row.cells)) {
      byCellPeriod[pid] = (byCellPeriod[pid] ?? 0) + days
    }
  }

  const closedPeriodIds = new Set(
    periods.filter((p) => p.status === 'FROZEN' || p.status === 'CONSOLIDATION').map((p) => p.id),
  )
  const totalActual = Object.entries(byCellPeriod)
    .filter(([pid]) => closedPeriodIds.has(pid))
    .reduce((s, [, d]) => s + d, 0)
  const totalRemaining = Object.entries(byCellPeriod)
    .filter(([pid]) => !closedPeriodIds.has(pid))
    .reduce((s, [, d]) => s + d, 0)

  return { byCellPeriod, totalActual, totalRemaining, total: totalActual + totalRemaining }
}

export function buildMarginInsight(
  rows: GridRow[],
  quotes: Quote[],
  profiles: Profile[],
  employees: Employee[],
): {
  employees: MarginInsightEmployee[]
  totalEtcCost: number
  totalContractValue: number
  marginForecast: number
  marginPercent: number
} {
  function getProfile(profileId: string) {
    return profiles.find((p) => p.id === profileId)
  }

  function getEmployee(employeeId: string | null) {
    if (!employeeId) return null
    return employees.find((e) => e.id === employeeId)
  }

  const empMap = new Map<string, MarginInsightEmployee>()

  for (const row of rows) {
    if (row.kind !== 'employee') continue
    if (!row.employeeId) continue
    if (row.totalRemaining === 0) continue

    const emp = getEmployee(row.employeeId)
    if (!emp) continue

    const profileDef = getProfile(row.profileId!)
    const assumedCostRate = profileDef?.defaultCostRatePerDay ?? 0
    const actualCostRate = emp.currentCostRatePerDay
    const rateImpact = actualCostRate - assumedCostRate
    const etcCost = row.totalRemaining * actualCostRate
    const totalImpact = rateImpact * row.totalRemaining

    const key = `${row.employeeId}-${row.profileId}`
    if (empMap.has(key)) {
      const existing = empMap.get(key)!
      existing.remainingDays += row.totalRemaining
      existing.etcCost += etcCost
      existing.totalImpact += totalImpact
    } else {
      empMap.set(key, {
        employeeId: row.employeeId,
        employeeName: emp.name,
        profileId: row.profileId!,
        profileName: profileDef?.name ?? row.profileId!,
        remainingDays: row.totalRemaining,
        actualCostRate,
        assumedCostRate,
        rateImpact,
        totalImpact,
        etcCost,
      })
    }
  }

  const empList = [...empMap.values()].sort((a, b) => b.remainingDays - a.remainingDays)

  let totalEtcCost = 0
  for (const row of rows) {
    if (row.kind !== 'employee') continue
    if (row.etcCost !== null) totalEtcCost += row.etcCost
  }

  let totalContractValue = 0
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      totalContractValue += line.revenueAmount
    }
  }

  let actualCostToDate = 0
  for (const row of rows) {
    if (row.kind !== 'employee') continue
    if (row.employeeId) {
      const emp = getEmployee(row.employeeId)
      if (emp) actualCostToDate += row.totalActual * emp.currentCostRatePerDay
    } else if (row.profileId) {
      const prof = getProfile(row.profileId)
      if (prof) actualCostToDate += row.totalActual * prof.defaultCostRatePerDay
    }
  }

  const eacCost = actualCostToDate + totalEtcCost
  const marginForecast = totalContractValue - eacCost
  const marginPercent = totalContractValue > 0 ? (marginForecast / totalContractValue) * 100 : 0

  return { employees: empList, totalEtcCost, totalContractValue, marginForecast, marginPercent }
}
