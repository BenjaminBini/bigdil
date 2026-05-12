import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PeriodInfo } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'

function TotalRow({ children }: { children: ReactNode }) {
  const { t } = useTranslation('pages')
  return (
    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-800">
      <StickyColumnCell shadowColor="#94a3b8" className="bg-slate-100 text-xs font-bold">
        {t('workTable.columnTotals')}
      </StickyColumnCell>
      {children}
    </tr>
  )
}

interface ColumnTotalsRowProps {
  periods: PeriodInfo[]
  byCellPeriod: Record<string, number>
}

export function ColumnTotalsRow({ periods, byCellPeriod }: ColumnTotalsRowProps) {
  return (
    <TotalRow>
      {periods.map((period) => {
        const total = byCellPeriod[period.code] ?? 0
        return (
          <td
            key={period.code}
            className={cn(
              'border-r border-slate-200 px-1.5 py-1 text-right text-xs font-mono tabular-nums',
              period.status === 'FROZEN' && 'bg-slate-200 text-slate-700',
              period.status === 'CONSOLIDATION' && 'bg-amber-500/8 text-amber-700/80 dark:text-amber-300/80',
              period.status === 'OPEN' && 'bg-primary/15 text-primary',
              period.status === 'FUTURE' && 'bg-slate-100 text-slate-700',
              total === 0 && 'text-slate-400',
            )}
          >
            {total === 0 ? '—' : formatDays(total)}
          </td>
        )
      })}
    </TotalRow>
  )
}
