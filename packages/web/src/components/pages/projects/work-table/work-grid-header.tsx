import { Lock } from 'lucide-react'
import type { Period } from '@/api/types'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface WorkGridHeaderProps {
  periods: Period[]
}

export function WorkGridHeader({ periods }: WorkGridHeaderProps) {
  return (
    <thead>
      <tr className="bg-slate-100 text-slate-600">
        <th className="sticky left-0 z-30 min-w-[260px] w-[260px] whitespace-nowrap border-b border-slate-300 bg-slate-100 px-3 py-1.5 text-left font-semibold shadow-[2px_0_0_0_#94a3b8]">
          Task / Phase
        </th>

        {periods.map((period) => {
          const isFrozen = period.status === 'FROZEN'
          const isConsolidation = period.status === 'CONSOLIDATION'
          const isOpen = period.status === 'OPEN'

          return (
            <th
              key={period.id}
              className={cn(
                'min-w-[56px] w-14 whitespace-nowrap border-b border-r border-slate-200 px-1 py-1 text-center',
                isFrozen && 'bg-slate-100 text-slate-500',
                isConsolidation && 'bg-amber-100 font-bold text-amber-700',
                isOpen && 'bg-sky-100 font-bold text-sky-700',
                !isFrozen && !isConsolidation && !isOpen && 'bg-slate-100 text-slate-600',
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-semibold">
                  W{period.periodNumber}
                  {(isFrozen || isConsolidation) && (
                    <Lock className="ml-0.5 inline-block size-2.5 opacity-60" />
                  )}
                </span>
                <span className="text-[10px] font-normal opacity-70">{formatShortDate(period.startDate)}</span>
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
