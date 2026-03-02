import { useState } from 'react'
import type {
  Employee,
  Period,
  Profile,
  ProfileTaskPeriodStart,
  Quote,
  Task,
  WorkTableCell,
} from '@/api/types'
import { isRowVisible } from './display'
import { computeFrozenData } from './frozen'
import { MarginInsightPanel } from './margin-insight-panel'
import { buildGridRows, buildMarginInsight, computeColumnTotals } from './model'
import { ConsolidationTable } from './consolidation-table'
import { SummaryBar } from './summary-bar'
import { WorkGridTable } from './work-grid-table'
import { WorkTableHeader } from './work-table-header'

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
  const allRows = buildGridRows(workTable, periods, flatTasks, quotes, profiles, employees)
  const columnTotals = computeColumnTotals(allRows, periods)
  const marginInsight = buildMarginInsight(allRows, quotes, profiles, employees)
  const frozenData = computeFrozenData(allRows, periods)

  const consolidationPeriod = periods.find((p) => p.status === 'CONSOLIDATION')
  const consolidationFrozenData = consolidationPeriod
    ? computeFrozenData(allRows, periods, consolidationPeriod.id)
    : frozenData

  const totalToPlan = allRows
    .filter((r) => r.kind === 'profile')
    .reduce((sum, r) => sum + (r.quotedDays - r.total), 0)

  const activePeriodId = periods.find((p) => p.status === 'OPEN')?.id ?? ''
  const periodStartMap = new Map<string, ProfileTaskPeriodStart>()
  for (const ps of periodStartData) {
    if (ps.periodId === activePeriodId) {
      periodStartMap.set(`${ps.taskId}:${ps.profileId}`, ps)
    }
  }

  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set())
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)

  const visibleRows = allRows.filter((row) => isRowVisible(row, collapsedPhases, collapsedTasks))

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
    <div className="flex h-full flex-col">
      <WorkTableHeader projectName={project.name} periodCount={periods.length} />

      <div className="relative flex-1 overflow-auto">
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
      </div>

      <div className="border-t">
        <ConsolidationTable
          allRows={allRows}
          frozenData={consolidationFrozenData}
          periods={periods}
          collapsedPhases={collapsedPhases}
          collapsedTasks={collapsedTasks}
          togglePhase={togglePhase}
          toggleTask={toggleTask}
        />
      </div>

      <SummaryBar totalToPlan={totalToPlan} grandTotalFrozen={frozenData.get('grand-total')} />
      <MarginInsightPanel insight={marginInsight} />
    </div>
  )
}
