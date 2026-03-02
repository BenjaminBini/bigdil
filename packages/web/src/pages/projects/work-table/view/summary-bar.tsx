import { MetricStrip } from '@/components/shared/metric-strip'
import { formatCurrency, formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FrozenData } from '@/lib/work-table/types'

interface SummaryBarProps {
  totalToPlan: number
  grandTotalFrozen?: FrozenData
}

export function SummaryBar({ totalToPlan, grandTotalFrozen }: SummaryBarProps) {
  return (
    <div className="shrink-0 border-t bg-white px-4 py-2">
      <MetricStrip
        items={[
          {
            label: 'To plan',
            value: (
              <span
                className={cn(
                  'font-mono font-semibold',
                  totalToPlan === 0
                    ? 'text-emerald-600'
                    : totalToPlan > 0
                      ? 'text-amber-600'
                      : 'text-red-600',
                )}
              >
                {totalToPlan > 0 ? '+' : ''}
                {formatDays(totalToPlan)}d
              </span>
            ),
          },
          {
            label: 'Project margin',
            value: grandTotalFrozen ? (
              <span
                className={cn(
                  'font-mono font-semibold',
                  grandTotalFrozen.trMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
                )}
              >
                {formatCurrency(grandTotalFrozen.trMargin)}
                {grandTotalFrozen.trMarginPct != null && (
                  <span className="ml-1 text-xs opacity-70">({grandTotalFrozen.trMarginPct.toFixed(1)}%)</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            ),
          },
          {
            label: 'Period margin',
            value: grandTotalFrozen ? (
              <span
                className={cn(
                  'font-mono font-semibold',
                  grandTotalFrozen.prMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
                )}
              >
                {formatCurrency(grandTotalFrozen.prMargin)}
                {grandTotalFrozen.prMarginPct != null && (
                  <span className="ml-1 text-xs opacity-70">({grandTotalFrozen.prMarginPct.toFixed(1)}%)</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            ),
          },
        ]}
      />
    </div>
  )
}
