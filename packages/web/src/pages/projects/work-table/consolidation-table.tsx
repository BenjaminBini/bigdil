import type { Period } from '@/api/types'
import { isRowVisible } from './display'
import { ConsolidationGridHeader } from './consolidation-grid-header'
import { ConsolidationGridRow } from './consolidation-grid-row'
import type { FrozenData, GridRow } from './types'

interface ConsolidationTableProps {
  allRows: GridRow[]
  frozenData: Map<string, FrozenData>
  periods: Period[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
}

export function ConsolidationTable({
  allRows,
  frozenData,
  periods,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
}: ConsolidationTableProps) {
  const consolidationPeriod = periods.find((period) => period.status === 'CONSOLIDATION')
  const endDateLabel = consolidationPeriod
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(new Date(consolidationPeriod.endDate))
    : '—'

  const visibleRows = allRows.filter((row) => isRowVisible(row, collapsedPhases, collapsedTasks))

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b bg-white px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-800">Consolidation on the {endDateLabel}</h2>
        {consolidationPeriod && (
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">
            W{consolidationPeriod.periodNumber}
          </span>
        )}
      </div>

      <div className="relative overflow-auto">
        <table className="border-collapse text-xs" style={{ minWidth: 'max-content' }}>
          <ConsolidationGridHeader />
          <tbody>
            {visibleRows.map((row) => (
              <ConsolidationGridRow
                key={row.id}
                row={row}
                frozenData={frozenData}
                collapsedPhases={collapsedPhases}
                collapsedTasks={collapsedTasks}
                togglePhase={togglePhase}
                toggleTask={toggleTask}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
