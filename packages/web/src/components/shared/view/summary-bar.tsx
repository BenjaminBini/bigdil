import { formatCurrency, formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FrozenData } from '@/pages/projects/work-table/types'

interface SummaryBarProps {
  totalToPlan: number
  grandTotalFrozen?: FrozenData
}

export function SummaryBar({ totalToPlan, grandTotalFrozen }: SummaryBarProps) {
  return (
    <div className="shrink-0 border-t bg-white px-4 py-2">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">To plan:</span>
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
        </div>

        <Divider />

        <MetricLabel
          label="Project margin"
          value={
            grandTotalFrozen ? (
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
            )
          }
        />

        <Divider />

        <MetricLabel
          label="Period margin"
          value={
            grandTotalFrozen ? (
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
            )
          }
        />
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-4 w-px bg-slate-200" />
}

interface MetricLabelProps {
  label: string
  value: React.ReactNode
}

function MetricLabel({ label, value }: MetricLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{label}:</span>
      {value}
    </div>
  )
}
