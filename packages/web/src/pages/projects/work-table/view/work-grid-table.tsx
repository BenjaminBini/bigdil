import type { Period, ProfileTaskPeriodStart } from '@/api/types'
import { ColumnTotalsRow } from './column-totals-row'
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
  columnTotals: { byCellPeriod: Record<string, number> }
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
  columnTotals,
}: WorkGridTableProps) {
  return (
    <table className="border-collapse text-xs" style={{ minWidth: 'max-content' }}>
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
          />
        ))}
        <ColumnTotalsRow periods={periods} byCellPeriod={columnTotals.byCellPeriod} />
      </tbody>
    </table>
  )
}
