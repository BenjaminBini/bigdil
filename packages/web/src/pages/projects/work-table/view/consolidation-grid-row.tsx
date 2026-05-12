import { useTranslation } from 'react-i18next'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { MarginPctSuffix } from '@/components/shared/metric-display'
import { cn } from '@/lib/utils'
import { FROZEN_COLS, formatFrozenValue, getFrozenMarginPct, getFrozenValue } from '@/lib/work-table/frozen'
import { getRowBackground, getSolidRowBackground } from '@/lib/work-table/display'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import type { PeriodInfo, Quote } from '@/api/types'
import { ConsolidationFormulaPopover } from './consolidation-formula-popover'

interface ConsolidationGridRowProps {
  row: GridRow
  rows: GridRow[]
  frozenData: Map<string, FrozenData>
  prevSnapshotRafMap: Map<string, number>
  prevSnapshotMonthCode: string | null
  periods: PeriodInfo[]
  quotes: Quote[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
}

export function ConsolidationGridRow({
  row,
  rows,
  frozenData,
  prevSnapshotRafMap,
  prevSnapshotMonthCode,
  periods,
  quotes,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
}: ConsolidationGridRowProps) {
  const { t } = useTranslation('pages')
  const rowBg = getRowBackground(row)
  const solidBg = getSolidRowBackground(row)
  const detail = frozenData.get(row.id)
  const prevRaf =
    row.kind === 'profile' && row.taskId && row.profileId
      ? prevSnapshotRafMap.get(`${row.taskId}::${row.profileId}`)
      : undefined

  return (
    <tr className={cn('group', rowBg, row.kind === 'grand-total' && 'border-t-2 border-row-divider')}>
      <StickyColumnCell className={cn(solidBg, row.kind === 'phase' && 'border-b border-row-divider text-sm font-bold text-foreground', row.kind === 'task' && 'font-semibold text-foreground/80', row.kind === 'profile' && 'text-xs text-muted-foreground', row.kind === 'employee' && 'text-xs', row.kind === 'employee' && row.employeeId === null && 'italic text-muted-foreground/70', row.kind === 'employee' && row.employeeId !== null && 'text-foreground/70', row.kind === 'grand-total' && 'border-b border-row-divider font-bold text-foreground')}>
        <TreeRowLabel
          label={row.label}
          depth={row.depth}
          isExpanded={
            row.kind === 'phase'
              ? !collapsedPhases.has(row.phaseId)
              : row.kind === 'task' && row.taskId
                ? !collapsedTasks.has(row.taskId)
                : undefined
          }
          onToggle={
            row.kind === 'phase'
              ? () => togglePhase(row.phaseId)
              : row.kind === 'task' && row.taskId
                ? () => toggleTask(row.taskId!)
                : undefined
          }
        />
      </StickyColumnCell>

      {FROZEN_COLS.map((col) => {
        const value = detail ? getFrozenValue(detail, col.key) : null
        const isMarginCol = col.format === 'margin'
        const isEmpty = value === null || value === 0
        const pct = detail && isMarginCol ? getFrozenMarginPct(detail, col.key) : undefined
        const cellInner = (
          <button
            type="button"
            className={cn(
              'w-full cursor-pointer text-right outline-none',
              'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
              'hover:bg-foreground/5',
            )}
            title={t('workTable.consolidationTable.viewFormula')}
          >
            {formatFrozenValue(value, col.format)}
            {isMarginCol && pct != null && !isEmpty && <MarginPctSuffix>{pct.toFixed(1)}%</MarginPctSuffix>}
          </button>
        )

        return (
          <td
            key={col.key}
            className={cn(
              'px-1 py-1 text-right text-xs font-mono tabular-nums',
              rowBg,
              isEmpty && 'text-muted-foreground/40',
              !isEmpty && !isMarginCol && 'text-foreground/80',
              isMarginCol && !isEmpty && value! > 0 && 'text-emerald-600 dark:text-emerald-400',
              isMarginCol && !isEmpty && value! < 0 && 'text-red-600 dark:text-red-400',
              row.kind === 'phase' && 'font-semibold',
              row.kind === 'grand-total' && 'font-bold',
              row.kind === 'employee' && 'text-muted-foreground',
            )}
            style={{ width: col.w, minWidth: col.w }}
          >
            {detail ? (
              <ConsolidationFormulaPopover
                col={col}
                row={row}
                fd={detail}
                rows={rows}
                frozenData={frozenData}
                prevRaf={prevRaf}
                prevSnapshotMonthCode={prevSnapshotMonthCode}
                periods={periods}
                quotes={quotes}
                trigger={cellInner}
              />
            ) : (
              cellInner
            )}
          </td>
        )
      })}
    </tr>
  )
}
