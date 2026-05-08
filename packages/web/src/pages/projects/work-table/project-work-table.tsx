import { useMemo, useState } from 'react'
import type { Employee, Period, Profile, ProfileTaskPeriodStart, Quote, Task, WorkTableCell } from '@/api/types'
import { PanelLayout, ScrollPane } from '@/components/ui/panel-layout'
import { Separator } from '@/components/ui/separator'
import { ConsolidationTable } from './view/consolidation-table'
import { MarginInsightPanel } from './view/margin-insight-panel'
import { SummaryBar } from './view/summary-bar'
import { WorkGridTable } from './view/work-grid-table'
import { WorkTableHeader } from './view/work-table-header'
import { isRowVisible } from '@/lib/work-table/display'
import { computeFrozenData } from '@/lib/work-table/frozen'
import { buildGridRows } from './grid-builder'
import { buildMarginInsight } from './margin-insight-builder'

interface ProjectWorkTableProps {
  projectId: string
  project: { name: string }
  periods: Period[]
  workTable: WorkTableCell[]
  flatTasks: Task[]
  quotes: Quote[]
  periodStartData: ProfileTaskPeriodStart[]
  profiles: Profile[]
  employees: Employee[]
  onSaveCell?: (params: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) => void
  onAssignEmployee?: (params: { taskId: string; profileId: string; employeeId: string }) => void
}

export function ProjectWorkTable({
  projectId,
  project,
  periods,
  workTable,
  flatTasks,
  quotes,
  periodStartData,
  profiles,
  employees,
  onSaveCell,
  onAssignEmployee,
}: ProjectWorkTableProps) {
  const allRows = useMemo(
    () => buildGridRows(workTable, periods, flatTasks, quotes, profiles, employees),
    [workTable, periods, flatTasks, quotes, profiles, employees],
  )

  const marginInsight = useMemo(
    () => buildMarginInsight(allRows, quotes, profiles, employees),
    [allRows, quotes, profiles, employees],
  )

  const frozenData = useMemo(() => computeFrozenData(allRows, periods), [allRows, periods])

  const consolidationPeriod = periods.find((p) => p.status === 'CONSOLIDATION')

  const consolidationFrozenData = useMemo(() => {
    return consolidationPeriod ? computeFrozenData(allRows, periods, consolidationPeriod.id) : frozenData
  }, [allRows, periods, frozenData, consolidationPeriod])

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
          projectId={projectId}
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
          employees={employees}
          onSaveCell={onSaveCell}
          onAssignEmployee={onAssignEmployee}
        />
      </ScrollPane>
      <Separator />
      {consolidationPeriod && (
        <ConsolidationTable
          visibleRows={visibleRows}
          frozenData={consolidationFrozenData}
          periods={periods}
          collapsedPhases={collapsedPhases}
          collapsedTasks={collapsedTasks}
          togglePhase={togglePhase}
          toggleTask={toggleTask}
        />
      )}
      <SummaryBar totalToPlan={totalToPlan} grandTotalFrozen={frozenData.get('grand-total')} />
      <MarginInsightPanel insight={marginInsight} />
    </PanelLayout>
  )
}
