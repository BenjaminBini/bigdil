import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { MarginPctSuffix } from '@/components/shared/metric-display'
import { cn } from '@/lib/utils'
import { FROZEN_COLS, formatFrozenValue, getFrozenMarginPct, getFrozenValue } from '@/lib/work-table/frozen'
import { getRowBackground } from '@/lib/work-table/display'
import type { FrozenData, GridRow } from '@/lib/work-table/types'

interface ConsolidationGridRowProps {
  row: GridRow
  frozenData: Map<string, FrozenData>
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
}

export function ConsolidationGridRow({
  row,
  frozenData,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
}: ConsolidationGridRowProps) {
  const rowBg = getRowBackground(row)
  const detail = frozenData.get(row.id)

  return (
    <tr className={cn('group', rowBg, row.kind === 'grand-total' && 'border-t-2 border-slate-300')}>
      <StickyColumnCell className={cn('border-b border-slate-200', rowBg, row.kind === 'phase' && 'text-sm font-bold text-slate-800', row.kind === 'task' && 'font-semibold text-slate-700', row.kind === 'profile' && 'text-xs text-slate-500', row.kind === 'employee' && 'text-xs', row.kind === 'employee' && row.employeeId === null && 'italic text-slate-400', row.kind === 'employee' && row.employeeId !== null && 'text-slate-600', row.kind === 'grand-total' && 'font-bold text-slate-900')}>
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

      {FROZEN_COLS.map((col, index) => {
        const value = detail ? getFrozenValue(detail, col.key) : null
        const isMarginCol = col.format === 'margin'
        const isEmpty = value === null || value === 0
        const pct = detail && isMarginCol ? getFrozenMarginPct(detail, col.key) : undefined

        return (
          <td
            key={col.key}
            className={cn(
              'border-b border-slate-100 px-1 py-1 text-right text-xs font-mono tabular-nums',
              rowBg,
              index === 7 || index === 13 ? 'border-r-2 border-r-slate-400' : index === 3 || index === 6 || index === 10 || index === 12 ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-100',
              isEmpty && 'text-slate-300',
              !isEmpty && !isMarginCol && 'text-slate-700',
              isMarginCol && !isEmpty && value! > 0 && 'text-emerald-700',
              isMarginCol && !isEmpty && value! < 0 && 'text-red-600',
              row.kind === 'phase' && 'font-semibold',
              row.kind === 'grand-total' && 'font-bold',
              row.kind === 'employee' && 'text-slate-500',
            )}
            style={{ width: col.w, minWidth: col.w }}
          >
            {formatFrozenValue(value, col.format)}
            {isMarginCol && pct != null && !isEmpty && <MarginPctSuffix>{pct.toFixed(1)}%</MarginPctSuffix>}
          </td>
        )
      })}
    </tr>
  )
}
