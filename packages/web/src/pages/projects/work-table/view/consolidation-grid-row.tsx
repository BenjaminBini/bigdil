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
    <tr className={cn('group', rowBg, row.kind === 'grand-total' && 'border-t-2 border-border')}>
      <StickyColumnCell className={cn('border-b border-border/70', rowBg, row.kind === 'phase' && 'text-sm font-bold text-foreground', row.kind === 'task' && 'font-semibold text-foreground/80', row.kind === 'profile' && 'text-xs text-muted-foreground', row.kind === 'employee' && 'text-xs', row.kind === 'employee' && row.employeeId === null && 'italic text-muted-foreground/70', row.kind === 'employee' && row.employeeId !== null && 'text-foreground/70', row.kind === 'grand-total' && 'font-bold text-foreground')}>
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
              'border-b border-border/50 px-1 py-1 text-right text-xs font-mono tabular-nums',
              rowBg,
              index === 7 || index === 13 ? 'border-r-2 border-r-border' : index === 3 || index === 6 || index === 10 || index === 12 ? 'border-r-2 border-r-border/70' : 'border-r border-r-border/40',
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
            {formatFrozenValue(value, col.format)}
            {isMarginCol && pct != null && !isEmpty && <MarginPctSuffix>{pct.toFixed(1)}%</MarginPctSuffix>}
          </td>
        )
      })}
    </tr>
  )
}
