/* eslint-disable max-lines */
import { useMemo, useState } from 'react'
import type { Employee, Period, Profile, ProfileTaskPeriodStart, Quote, Task, WorkTableCell } from '@/api/types'
import { PanelLayout, ScrollPane } from '@/components/ui/panel-layout'
import { Separator } from '@/components/ui/separator'
import { ConsolidationTable } from '@/components/shared/view/consolidation-table'
import { MarginInsightPanel } from '@/components/shared/view/margin-insight-panel'
import { SummaryBar } from '@/components/shared/view/summary-bar'
import { WorkGridTable } from '@/components/shared/view/work-grid-table'
import { WorkTableHeader } from '@/components/shared/view/work-table-header'
import { isRowVisible } from './display'
import { computeFrozenData } from './frozen'
import type { GridRow, MarginInsightEmployee } from './types'

interface ProjectWorkTableProps {
  project: { name: string }
  periods: Period[]
  workTable: WorkTableCell[]
  flatTasks: Task[]
  quotes: Quote[]
  periodStartData: ProfileTaskPeriodStart[]
  profiles: Profile[]
  employees: Employee[]
}

function getClosedPeriodIds(periods: Period[]): Set<string> {
  return new Set(
    periods.filter((p) => p.status === 'FROZEN' || p.status === 'CONSOLIDATION').map((p) => p.id),
  )
}

function splitActualRemaining(
  cells: Record<string, number>,
  closedPeriodIds: Set<string>,
): { actual: number; remaining: number } {
  let actual = 0
  let remaining = 0
  for (const [periodId, days] of Object.entries(cells)) {
    if (closedPeriodIds.has(periodId)) actual += days
    else remaining += days
  }
  return { actual, remaining }
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

function mergeCells(...cellMaps: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const map of cellMaps) {
    for (const [periodId, days] of Object.entries(map)) {
      result[periodId] = (result[periodId] ?? 0) + days
    }
  }
  return result
}
function buildGridRows(
  workTable: WorkTableCell[],
  periods: Period[],
  flatTasks: Task[],
  quotes: Quote[],
  profiles: Profile[],
  employees: Employee[],
): GridRow[] {
  const closedPeriodIds = getClosedPeriodIds(periods)
  const taskMap = indexById(flatTasks)
  const profileMap = indexById(profiles)
  const employeeMap = indexById(employees)

  function getPhase(taskId: string): Task | null {
    const task = taskMap.get(taskId)
    if (!task) return null
    if (!task.parentTaskId) return task
    return taskMap.get(task.parentTaskId) ?? null
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
    const phase = getPhase(cell.taskId)
    if (!phase) continue
    const phaseId = phase.id

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
    empCells[cell.periodId] = (empCells[cell.periodId] ?? 0) + cell.days
  }

  function makeSummary(
    cells: Record<string, number>,
    taskId: string | undefined,
    profileId: string | undefined,
    employeeId: string | null | undefined,
  ) {
    const { actual: totalActual, remaining: totalRemaining } = splitActualRemaining(
      cells,
      closedPeriodIds,
    )
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
      quotedDays,
      variance,
      forecastCostRate,
      forecastSellRate,
      etcCost,
    }
  }

  const rows: GridRow[] = []
  const grandTotalCells: Record<string, number> = {}

  for (const phaseId of phaseOrder) {
    const phaseEntry = phaseGrouping.get(phaseId)!
    const phaseDef = taskMap.get(phaseId)
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

    for (const [periodId, days] of Object.entries(phaseCells)) {
      grandTotalCells[periodId] = (grandTotalCells[periodId] ?? 0) + days
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

  const { actual: grandTotalActual, remaining: grandTotalRemaining } = splitActualRemaining(
    grandTotalCells,
    closedPeriodIds,
  )

  orderedRows.push({
    id: 'grand-total',
    kind: 'grand-total',
    phaseId: '',
    label: 'Grand Total',
    depth: 0,
    cells: grandTotalCells,
    totalActual: grandTotalActual,
    totalRemaining: grandTotalRemaining,
    total: grandTotalActual + grandTotalRemaining,
    quotedDays: 0,
    variance: 0,
    forecastCostRate: null,
    forecastSellRate: null,
    etcCost: null,
  })

  return orderedRows
}
function computeColumnTotals(
  rows: GridRow[],
  periods: Period[],
): {
  byCellPeriod: Record<string, number>
  totalActual: number
  totalRemaining: number
  total: number
} {
  const byCellPeriod: Record<string, number> = {}
  for (const row of rows) {
    if (row.kind !== 'employee') continue
    for (const [periodId, days] of Object.entries(row.cells)) {
      byCellPeriod[periodId] = (byCellPeriod[periodId] ?? 0) + days
    }
  }

  const closedPeriodIds = getClosedPeriodIds(periods)
  const { actual: totalActual, remaining: totalRemaining } = splitActualRemaining(
    byCellPeriod,
    closedPeriodIds,
  )

  return { byCellPeriod, totalActual, totalRemaining, total: totalActual + totalRemaining }
}
function buildMarginInsight(
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
  const profileMap = indexById(profiles)
  const employeeMap = indexById(employees)

  const insightMap = new Map<string, MarginInsightEmployee>()
  let totalEtcCost = 0
  let actualCostToDate = 0

  // Single pass over employee rows
  for (const row of rows) {
    if (row.kind !== 'employee') continue

    // Accumulate totalEtcCost
    if (row.etcCost !== null) totalEtcCost += row.etcCost

    // Accumulate actualCostToDate
    if (row.employeeId) {
      const employee = employeeMap.get(row.employeeId)
      if (employee) actualCostToDate += row.totalActual * employee.currentCostRatePerDay
    } else if (row.profileId) {
      const profile = profileMap.get(row.profileId)
      if (profile) actualCostToDate += row.totalActual * profile.defaultCostRatePerDay
    }

    // Build margin insight per employee
    if (!row.employeeId || row.totalRemaining === 0) continue
    const employee = employeeMap.get(row.employeeId)
    if (!employee) continue

    const profile = profileMap.get(row.profileId!)
    const assumedCostRate = profile?.defaultCostRatePerDay ?? 0
    const actualCostRate = employee.currentCostRatePerDay
    const rateImpact = actualCostRate - assumedCostRate
    const etcCost = row.totalRemaining * actualCostRate
    const totalImpact = rateImpact * row.totalRemaining

    const key = `${row.employeeId}-${row.profileId}`
    if (insightMap.has(key)) {
      const existing = insightMap.get(key)!
      existing.remainingDays += row.totalRemaining
      existing.etcCost += etcCost
      existing.totalImpact += totalImpact
    } else {
      insightMap.set(key, {
        employeeId: row.employeeId,
        employeeName: employee.name,
        profileId: row.profileId!,
        profileName: profile?.name ?? row.profileId!,
        remainingDays: row.totalRemaining,
        actualCostRate,
        assumedCostRate,
        rateImpact,
        totalImpact,
        etcCost,
      })
    }
  }

  const employeeRows = [...insightMap.values()].sort((a, b) => b.remainingDays - a.remainingDays)

  let totalContractValue = 0
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      totalContractValue += line.revenueAmount
    }
  }

  const eacCost = actualCostToDate + totalEtcCost
  const marginForecast = totalContractValue - eacCost
  const marginPercent = totalContractValue > 0 ? (marginForecast / totalContractValue) * 100 : 0

  return {
    employees: employeeRows,
    totalEtcCost,
    totalContractValue,
    marginForecast,
    marginPercent,
  }
}
export function ProjectWorkTable({
  project,
  periods,
  workTable,
  flatTasks,
  quotes,
  periodStartData,
  profiles,
  employees,
}: ProjectWorkTableProps) {
  const allRows = useMemo(
    () => buildGridRows(workTable, periods, flatTasks, quotes, profiles, employees),
    [workTable, periods, flatTasks, quotes, profiles, employees],
  )

  const columnTotals = useMemo(() => computeColumnTotals(allRows, periods), [allRows, periods])

  const marginInsight = useMemo(
    () => buildMarginInsight(allRows, quotes, profiles, employees),
    [allRows, quotes, profiles, employees],
  )

  const frozenData = useMemo(() => computeFrozenData(allRows, periods), [allRows, periods])

  const consolidationFrozenData = useMemo(() => {
    const consolidationPeriod = periods.find((p) => p.status === 'CONSOLIDATION')
    return consolidationPeriod ? computeFrozenData(allRows, periods, consolidationPeriod.id) : frozenData
  }, [allRows, periods, frozenData])

  const totalToPlan = useMemo(
    () =>
      allRows
        .filter((r) => r.kind === 'profile')
        .reduce((sum, r) => sum + (r.quotedDays - r.total), 0),
    [allRows],
  )

  const periodStartMap = useMemo(() => {
    const activePeriodId = periods.find((p) => p.status === 'OPEN')?.id ?? ''
    const map = new Map<string, ProfileTaskPeriodStart>()
    for (const ps of periodStartData) {
      if (ps.periodId === activePeriodId) {
        map.set(`${ps.taskId}:${ps.profileId}`, ps)
      }
    }
    return map
  }, [periods, periodStartData])

  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set())
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)

  const visibleRows = useMemo(
    () => allRows.filter((row) => isRowVisible(row, collapsedPhases, collapsedTasks)),
    [allRows, collapsedPhases, collapsedTasks],
  )

  function togglePhase(phaseId: string) {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }

  function toggleTask(taskId: string) {
    setCollapsedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  return (
    <PanelLayout>
      <WorkTableHeader projectName={project.name} periodCount={periods.length} />
      <ScrollPane>
        <WorkGridTable
          periods={periods}
          visibleRows={visibleRows}
          collapsedPhases={collapsedPhases}
          collapsedTasks={collapsedTasks}
          togglePhase={togglePhase}
          toggleTask={toggleTask}
          expandedProfileId={expandedProfileId}
          setExpandedProfileId={setExpandedProfileId}
          frozenData={frozenData}
          periodStartMap={periodStartMap}
          columnTotals={columnTotals}
        />
      </ScrollPane>
      <Separator />
      <ConsolidationTable
        visibleRows={visibleRows}
        frozenData={consolidationFrozenData}
        periods={periods}
        collapsedPhases={collapsedPhases}
        collapsedTasks={collapsedTasks}
        togglePhase={togglePhase}
        toggleTask={toggleTask}
      />
      <SummaryBar totalToPlan={totalToPlan} grandTotalFrozen={frozenData.get('grand-total')} />
      <MarginInsightPanel insight={marginInsight} />
    </PanelLayout>
  )
}
