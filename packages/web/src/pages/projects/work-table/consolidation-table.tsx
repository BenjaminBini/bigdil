import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Period } from '@/api/types'
import { cn } from '@/lib/utils'
import { FROZEN_COLS, FROZEN_GROUPS, FROZEN_SUBGROUPS, formatFrozenValue, getFrozenMarginPct, getFrozenValue } from './frozen'
import { isRowVisible, getRowBackground } from './display'
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
  const consolidationPeriod = periods.find((p) => p.status === 'CONSOLIDATION')
  const endDateLabel = consolidationPeriod
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(
        new Date(consolidationPeriod.endDate),
      )
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
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th
                className="sticky left-0 z-30 min-w-[260px] w-[260px] whitespace-nowrap border-b border-slate-300 bg-slate-100 px-3 py-1.5 text-left font-semibold shadow-[2px_0_0_0_#94a3b8]"
                rowSpan={3}
              >
                Task / Phase
              </th>
              {FROZEN_GROUPS.map((g, gi) => (
                <th
                  key={g.label}
                  colSpan={g.colSpan}
                  className={cn(
                    'whitespace-nowrap border-b border-slate-300 bg-slate-200 px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-slate-700',
                    gi === 0 ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-300',
                  )}
                >
                  {g.label}
                </th>
              ))}
            </tr>

            <tr className="bg-slate-100 text-slate-500">
              {FROZEN_SUBGROUPS.map((sg, sgi) => (
                <th
                  key={`${sg.label}-${sgi}`}
                  colSpan={sg.colSpan}
                  className={cn(
                    'whitespace-nowrap border-b border-slate-200 bg-slate-100 px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wider',
                    sgi === 2 || sgi === 5
                      ? 'border-r-2 border-r-slate-400'
                      : 'border-r-2 border-r-slate-300',
                  )}
                >
                  {sg.label}
                </th>
              ))}
            </tr>

            <tr className="bg-slate-50 text-slate-500">
              {FROZEN_COLS.map((col, ci) => (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap border-b-2 border-slate-300 bg-slate-50 px-1 py-1 text-right text-[10px] font-medium',
                    ci === 7 || ci === 13
                      ? 'border-r-2 border-r-slate-400'
                      : ci === 3 || ci === 6 || ci === 10 || ci === 12
                        ? 'border-r-2 border-r-slate-300'
                        : 'border-r border-r-slate-100',
                  )}
                  style={{ width: col.w, minWidth: col.w }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => {
              const rowBg = getRowBackground(row)

              return (
                <tr
                  key={row.id}
                  className={cn('group', rowBg, row.kind === 'grand-total' && 'border-t-2 border-slate-300')}
                >
                  <td
                    className={cn(
                      'sticky left-0 z-20 min-w-[260px] w-[260px] whitespace-nowrap border-b border-slate-200 px-3 py-1.5 shadow-[2px_0_0_0_#cbd5e1]',
                      rowBg,
                      row.kind === 'phase' && 'text-sm font-bold text-slate-800',
                      row.kind === 'task' && 'font-semibold text-slate-700',
                      row.kind === 'profile' && 'text-xs text-slate-500',
                      row.kind === 'employee' && 'text-xs',
                      row.kind === 'employee' && row.employeeId === null && 'italic text-slate-400',
                      row.kind === 'employee' && row.employeeId !== null && 'text-slate-600',
                      row.kind === 'grand-total' && 'font-bold text-slate-900',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {row.depth > 0 && <span style={{ display: 'inline-block', width: row.depth * 16 }} />}
                      {row.kind === 'phase' && (
                        <button
                          onClick={() => togglePhase(row.phaseId)}
                          className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
                        >
                          {collapsedPhases.has(row.phaseId) ? (
                            <ChevronRight className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </button>
                      )}
                      {row.kind === 'task' && row.taskId && (
                        <button
                          onClick={() => toggleTask(row.taskId!)}
                          className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
                        >
                          {collapsedTasks.has(row.taskId) ? (
                            <ChevronRight className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </button>
                      )}
                      <span className="max-w-[210px] truncate" title={row.label}>
                        {row.label}
                      </span>
                    </div>
                  </td>

                  {FROZEN_COLS.map((col, ci) => {
                    const fd = frozenData.get(row.id)
                    const value = fd ? getFrozenValue(fd, col.key) : null
                    const isMarginCol = col.format === 'margin'
                    const isEmpty = value === null || value === 0
                    const pct = fd && isMarginCol ? getFrozenMarginPct(fd, col.key) : undefined

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'border-b border-slate-100 px-1 py-1 text-right text-xs font-mono tabular-nums',
                          rowBg,
                          ci === 7 || ci === 13
                            ? 'border-r-2 border-r-slate-400'
                            : ci === 3 || ci === 6 || ci === 10 || ci === 12
                              ? 'border-r-2 border-r-slate-300'
                              : 'border-r border-r-slate-100',
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
                        {isMarginCol && pct != null && !isEmpty && (
                          <span className="ml-0.5 text-[9px] opacity-70">{pct.toFixed(1)}%</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
