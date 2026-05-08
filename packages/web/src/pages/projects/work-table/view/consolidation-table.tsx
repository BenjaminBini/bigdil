import type { ReactNode } from 'react'
import type { Period } from '@/api/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { FlexRow } from '@/components/shared/layouts'
import { GridTable } from '@/components/shared/grid-table'
import { ConsolidationGridHeader } from './consolidation-grid-header'
import { ConsolidationGridRow } from './consolidation-grid-row'
import type { FrozenData, GridRow } from '@/lib/work-table/types'

function ConsolidationShell({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>
}

function ConsolidationTitleBar({ children }: { children: ReactNode }) {
  return (
    <FlexRow gap="md" className="border-b bg-card px-4 py-2">
      {children}
    </FlexRow>
  )
}

function ConsolidationTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-semibold text-foreground">{children}</h2>
}

function ConsolidationScrollArea({ children }: { children: ReactNode }) {
  return <div className="relative overflow-auto">{children}</div>
}

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
    <ConsolidationShell>
      <ConsolidationTitleBar>
        <ConsolidationTitle>Consolidation on the {endDateLabel}</ConsolidationTitle>
        {consolidationPeriod && (
          <StatusBadge status="CONSOLIDATION" label={`W${consolidationPeriod.periodNumber}`} />
        )}
      </ConsolidationTitleBar>

      <ConsolidationScrollArea>
        <GridTable>
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
        </GridTable>
      </ConsolidationScrollArea>
    </ConsolidationShell>
  )
}
