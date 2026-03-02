import type { Period } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ColumnTotalsRowProps {
  periods: Period[]
  byCellPeriod: Record<string, number>
}

export function ColumnTotalsRow({ periods, byCellPeriod }: ColumnTotalsRowProps) {
  return (
    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-800">
      <StickyColumnCell shadowColor="#94a3b8" className="bg-slate-100 text-xs font-bold">
        Column Totals
      </StickyColumnCell>
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
