import type { Period } from '@/api/types'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ColumnTotalsRowProps {
  periods: Period[]
  byCellPeriod: Record<string, number>
}

export function ColumnTotalsRow({ periods, byCellPeriod }: ColumnTotalsRowProps) {
  return (
    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-800">
      <td className="sticky left-0 z-20 min-w-[260px] w-[260px] whitespace-nowrap bg-slate-100 px-3 py-1.5 text-xs font-bold shadow-[2px_0_0_0_#94a3b8]">
        Column Totals
      </td>
      {periods.map((period) => {
        const total = byCellPeriod[period.id] ?? 0
        return (
          <td
            key={period.id}
            className={cn(
              'border-r border-slate-200 px-1.5 py-1 text-right text-xs font-mono tabular-nums',
              period.status === 'FROZEN' && 'bg-slate-200 text-slate-700',
              period.status === 'CONSOLIDATION' && 'bg-amber-100 text-amber-800',
              period.status === 'OPEN' && 'bg-sky-100 text-sky-800',
              period.status === 'FUTURE' && 'bg-slate-100 text-slate-700',
              total === 0 && 'text-slate-400',
            )}
          >
            {total === 0 ? '—' : formatDays(total)}
          </td>
        )
      })}
    </tr>
  )
}
