import { ChevronRight, ChevronDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { QuoteGridRow } from './model'

interface QuoteGridProps {
  rows: QuoteGridRow[]
  isReadOnly: boolean
  collapsed: Record<string, boolean>
  onToggle: (rowId: string) => void
  hasChildrenSet: Set<string>
}

export function QuoteGrid({ rows, isReadOnly, collapsed, onToggle, hasChildrenSet }: QuoteGridProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <colgroup>
        <col className="min-w-[260px]" />
        <col className="w-[80px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[80px]" />
      </colgroup>

      <thead className="sticky top-0 z-10 bg-gray-50">
        <tr className="border-b border-gray-200">
          <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Task / Profile
          </th>
          <th rowSpan={2} className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Days
          </th>
          <th colSpan={2} className="text-center text-[10px] font-semibold text-blue-600 uppercase tracking-widest py-1.5 border-x border-gray-200">
            Revenue
          </th>
          <th colSpan={2} className="text-center text-[10px] font-semibold text-orange-600 uppercase tracking-widest py-1.5 border-r border-gray-200">
            Cost
          </th>
          <th colSpan={2} className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-widest py-1.5">
            Margin
          </th>
        </tr>
        <tr className="border-b border-gray-300">
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-l border-gray-200">Sell/Day</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Amount</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost/Day</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Amount</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
        </tr>
      </thead>

      <tbody>
        {rows.map(row => {
          const isPhase = row.kind === 'phase'
          const isTask = row.kind === 'task'
          const isProfile = row.kind === 'profile'
          const isGrandTotal = row.kind === 'grand-total'
          const isAggregate = isPhase || isTask || isGrandTotal
          const hasChildren = hasChildrenSet.has(row.id)
          const isCollapsed = collapsed[row.id] ?? false

          const marginColor = row.margin < 0
            ? 'text-red-600'
            : row.marginPct !== null && row.marginPct >= 40
              ? 'text-green-700'
              : 'text-gray-800'

          return (
            <tr
              key={row.id}
              className={cn(
                'border-b transition-colors',
                isGrandTotal && 'bg-gray-100 border-t-2 border-t-gray-300 font-bold',
                isPhase && 'bg-gray-50/80',
                isTask && 'bg-white',
                isProfile && 'bg-white hover:bg-blue-50/30',
                !isGrandTotal && !isPhase && 'hover:bg-gray-50/50',
              )}
            >
              <td className="px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  {row.depth > 0 && (
                    <span style={{ display: 'inline-block', width: row.depth * 20 }} className="shrink-0" />
                  )}

                  {hasChildren ? (
                    <button
                      onClick={() => onToggle(row.id)}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-400 shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="inline-block w-[18px] shrink-0" />
                  )}

                  <span
                    className={cn(
                      'truncate',
                      isPhase && 'font-semibold text-gray-900',
                      isTask && 'font-medium text-gray-800',
                      isProfile && 'text-sm text-gray-600',
                      isGrandTotal && 'font-bold text-gray-900',
                    )}
                  >
                    {row.label}
                  </span>
                </div>
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums', isAggregate ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                {row.days}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums border-l border-gray-100', isGrandTotal ? 'text-gray-600' : isAggregate ? 'text-gray-400' : 'text-gray-700')}>
                {row.sellRatePerDay !== null ? (
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    {row.isFrozenRate && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default"><Lock className="size-3 text-amber-500" /></span>
                          </TooltipTrigger>
                          <TooltipContent side="top">Frozen — matches existing project rate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isGrandTotal ? (
                      <span><span className="text-[10px] text-gray-400 mr-1">avg</span>{formatCurrency(Math.round(row.sellRatePerDay))}</span>
                    ) : isReadOnly ? formatCurrency(row.sellRatePerDay) : (
                      <input
                        type="number"
                        className="w-20 rounded border border-gray-300 px-1.5 py-0.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={row.sellRatePerDay}
                        min={0}
                      />
                    )}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums font-medium border-r border-gray-100', isAggregate ? 'text-gray-900' : 'text-gray-800')}>
                {formatCurrency(row.revenue)}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums', isGrandTotal ? 'text-gray-600' : isAggregate ? 'text-gray-400' : 'text-gray-600')}>
                {row.costRatePerDay !== null ? (
                  isGrandTotal ? (
                    <span><span className="text-[10px] text-gray-400 mr-1">avg</span>{formatCurrency(Math.round(row.costRatePerDay))}</span>
                  ) : isReadOnly ? formatCurrency(row.costRatePerDay) : (
                    <input
                      type="number"
                      className="w-20 rounded border border-gray-300 px-1.5 py-0.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={row.costRatePerDay}
                      min={0}
                    />
                  )
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums border-r border-gray-100', isAggregate ? 'text-gray-700' : 'text-gray-600')}>
                {formatCurrency(row.cost)}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums font-medium', marginColor)}>
                {formatCurrency(row.margin)}
              </td>

              <td className={cn('px-3 py-2.5 text-right tabular-nums', marginColor)}>
                {row.marginPct !== null ? `${row.marginPct.toFixed(1)}%` : '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
