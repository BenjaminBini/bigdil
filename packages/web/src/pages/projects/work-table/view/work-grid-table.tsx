import type { Period, ProfileTaskPeriodStart } from '@/api/types'
import { GridTable } from '@/components/shared/grid-table'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkGridHeader } from './work-grid-header'
import { WorkGridRow } from './work-grid-row'

interface WorkGridTableProps {
  periods: Period[]
  visibleRows: GridRow[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
  expandedProfileId: string | null
  setExpandedProfileId: (id: string | null) => void
  frozenData: Map<string, FrozenData>
  periodStartMap: Map<string, ProfileTaskPeriodStart>
  onSaveCell?: (params: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) => void
}

export function WorkGridTable({
  periods,
  visibleRows,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
  expandedProfileId,
  setExpandedProfileId,
  frozenData,
  periodStartMap,
  onSaveCell,
}: WorkGridTableProps) {
  return (
    <GridTable>
      <WorkGridHeader periods={periods} />
      <tbody>
        {visibleRows.map((row) => (
          <WorkGridRow
            key={row.id}
            row={row}
            periods={periods}
            collapsedPhases={collapsedPhases}
            collapsedTasks={collapsedTasks}
            togglePhase={togglePhase}
            toggleTask={toggleTask}
            expandedProfileId={expandedProfileId}
            setExpandedProfileId={setExpandedProfileId}
            frozenData={frozenData}
            periodStartMap={periodStartMap}
            onSaveCell={onSaveCell}
          />
        ))}
      </tbody>
    </GridTable>
  )
}
