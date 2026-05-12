import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PeriodInfo, Quote } from '@/api/types'
import { getPeriodLabel } from '@/lib/period-utils'
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

const localeFromLanguage = (lang: string): string => (lang.startsWith('fr') ? 'fr-FR' : 'en-GB')

interface ConsolidationTableProps {
  visibleRows: GridRow[]
  allRows: GridRow[]
  frozenData: Map<string, FrozenData>
  prevSnapshotRafMap: Map<string, number>
  prevSnapshotMonthCode: string | null
  quotes: Quote[]
  periods: PeriodInfo[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
}

export function ConsolidationTable({
  visibleRows,
  allRows,
  frozenData,
  prevSnapshotRafMap,
  prevSnapshotMonthCode,
  quotes,
  periods,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
}: ConsolidationTableProps) {
  const { t, i18n } = useTranslation('pages')
  const endDateFormatter = new Intl.DateTimeFormat(localeFromLanguage(i18n.language), {
    day: '2-digit',
    month: '2-digit',
  })
  // Display end-date of the LATEST consolidation period — when several weekly
  // slices are simultaneously CONSOLIDATION (e.g., OPEN advanced multiple
  // times within the same month), the table represents the cumulative
  // consolidation through the most recent of them.
  const consolidationPeriod = [...periods].reverse().find((period) => period.status === 'CONSOLIDATION')
  const endDateLabel = consolidationPeriod
    ? endDateFormatter.format(new Date(consolidationPeriod.endDate))
    : '—'

  return (
    <ConsolidationShell>
      <ConsolidationTitleBar>
        <ConsolidationTitle>
          {t('workTable.consolidationTable.title', { date: endDateLabel })}
        </ConsolidationTitle>
        {consolidationPeriod && (
          <StatusBadge
            status="CONSOLIDATION"
            label={getPeriodLabel(consolidationPeriod.weekCode ?? consolidationPeriod.monthCode)}
          />
        )}
      </ConsolidationTitleBar>

      <ConsolidationScrollArea>
        <GridTable>
          <ConsolidationGridHeader />
          <tbody>
            {visibleRows
              .filter((row) => row.kind !== 'quote')
              .map((row) => (
                <ConsolidationGridRow
                  key={row.id}
                  row={row}
                  rows={allRows}
                  frozenData={frozenData}
                  prevSnapshotRafMap={prevSnapshotRafMap}
                  prevSnapshotMonthCode={prevSnapshotMonthCode}
                  periods={periods}
                  quotes={quotes}
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
