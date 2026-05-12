import { useEffect, useMemo, useRef, useState } from 'react'
import type { Employee, Phase, PeriodInfo, PreviousSnapshotRaf, Profile, ProfileTaskPeriodStart, Quote, WorkTableCell } from '@/api/types'
import { PanelLayout } from '@/components/ui/panel-layout'
import { Separator } from '@/components/ui/separator'
import { ConsolidationTable } from './view/consolidation-table'
import { ConsolidationQuoteBanner } from './view/consolidation-quote-banner'
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
  periods: PeriodInfo[]
  workTable: WorkTableCell[]
  phases: Phase[]
  quotes: Quote[]
  periodStartData: ProfileTaskPeriodStart[]
  previousSnapshotRaf: PreviousSnapshotRaf[]
  previousSnapshotMonthCode: string | null
  profiles: Profile[]
  employees: Employee[]
  onSaveCell?: (params: { taskId: string; profileId: string; employeeId?: string; periodCode: string; days: number }) => void
  onAssignEmployee?: (params: { taskId: string; profileId: string; employeeId: string }) => void
}

export function ProjectWorkTable({
  projectId,
  project,
  periods,
  workTable,
  phases,
  quotes,
  periodStartData,
  previousSnapshotRaf,
  previousSnapshotMonthCode,
  profiles,
  employees,
  onSaveCell,
  onAssignEmployee,
}: ProjectWorkTableProps) {
  const allRows = useMemo(
    () => buildGridRows(workTable, periods, phases, quotes, profiles, employees),
    [workTable, periods, phases, quotes, profiles, employees],
  )

  const marginInsight = useMemo(
    () => buildMarginInsight(allRows, quotes, profiles, employees),
    [allRows, quotes, profiles, employees],
  )

  const frozenData = useMemo(() => computeFrozenData(allRows, periods), [allRows, periods])

  const consolidationPeriods = useMemo(
    () => periods.filter((p) => p.status === 'CONSOLIDATION'),
    [periods],
  )
  // Latest consolidation slice — drives the displayed end-date label.
  const consolidationPeriod = consolidationPeriods[consolidationPeriods.length - 1]

  const prevSnapshotRafMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const entry of previousSnapshotRaf) {
      map.set(`${entry.taskId}::${entry.profileId}`, entry.days)
    }
    return map
  }, [previousSnapshotRaf])

  const consolidationFrozenData = useMemo(() => {
    if (consolidationPeriods.length === 0) return frozenData
    return computeFrozenData(
      allRows,
      periods,
      consolidationPeriods.map((p) => p.code),
      { prevSnapshotRaf: prevSnapshotRafMap },
    )
  }, [allRows, periods, frozenData, consolidationPeriods, prevSnapshotRafMap])

  const totalToPlan = useMemo(
    () =>
      allRows
        .filter((r) => r.kind === 'profile')
        .reduce((sum, r) => sum + (r.quotedDays - r.total), 0),
    [allRows],
  )

  const periodStartMap = useMemo(() => {
    const activePeriodCode = periods.find((p) => p.status === 'OPEN')?.monthCode ?? ''
    const map = new Map<string, ProfileTaskPeriodStart>()
    for (const ps of periodStartData) {
      if (ps.periodCode === activePeriodCode) {
        map.set(`${ps.taskId}:${ps.profileId}`, ps)
      }
    }
    return map
  }, [periods, periodStartData])

  // For each (task, profile), the set of already-assigned named employee ids.
  // Used to filter the multi-employee picker on profile rows so we don't offer
  // an employee already attached to the same slot.
  const assignedEmployeesByProfile = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const row of allRows) {
      if (row.kind !== 'employee' || !row.taskId || !row.profileId || !row.employeeId) continue
      const key = `${row.taskId}:${row.profileId}`
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(row.employeeId)
    }
    return map
  }, [allRows])

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

  // The detail card sits in an inline `<tr>` below the clicked profile row,
  // but must NOT span the full table scroll-width. We measure the scroll
  // container's visible width here and expose it as a CSS variable so the
  // detail card's inner div can size itself against the viewport rather
  // than its colSpan-wide td.
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const update = () => setViewportWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <PanelLayout>
      <WorkTableHeader projectName={project.name} periodCount={periods.length} />
      <ConsolidationQuoteBanner periods={periods} quotes={quotes} />
      {/* Plain horizontal scroller — must be width-bounded so the table can
        * overflow it. position: sticky on the first column anchors against
        * the scrollbar of this div. */}
      <div
        ref={scrollerRef}
        className="relative w-full min-w-0 overflow-x-auto"
        style={{ ['--wt-viewport' as string]: `${viewportWidth}px` }}
      >
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
          assignedEmployeesByProfile={assignedEmployeesByProfile}
          onSaveCell={onSaveCell}
          onAssignEmployee={onAssignEmployee}
        />
      </div>
      <Separator />
      {consolidationPeriod && (
        <ConsolidationTable
          visibleRows={visibleRows}
          allRows={allRows}
          frozenData={consolidationFrozenData}
          prevSnapshotRafMap={prevSnapshotRafMap}
          prevSnapshotMonthCode={previousSnapshotMonthCode}
          quotes={quotes}
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
