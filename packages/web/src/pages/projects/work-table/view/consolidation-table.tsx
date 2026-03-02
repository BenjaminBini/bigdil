import type { Period } from '@/api/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConsolidationGridHeader } from './consolidation-grid-header'
import { ConsolidationGridRow } from './consolidation-grid-row'
import type { FrozenData, GridRow } from '@/lib/work-table/types'

const endDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' })

interface ConsolidationTableProps {
  visibleRows: GridRow[]
  frozenData: Map<string, FrozenData>
  periods: Period[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
}

export function ConsolidationTable({
  visibleRows,
  frozenData,
  periods,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
}: ConsolidationTableProps) {
  const consolidationPeriod = periods.find((period) => period.status === 'CONSOLIDATION')
  const endDateLabel = consolidationPeriod
    ? endDateFormatter.format(new Date(consolidationPeriod.endDate))
    : '—'

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b bg-white px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-800">Consolidation on the {endDateLabel}</h2>
        {consolidationPeriod && (
          <StatusBadge status="CONSOLIDATION" label={`W${consolidationPeriod.periodNumber}`} />
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
