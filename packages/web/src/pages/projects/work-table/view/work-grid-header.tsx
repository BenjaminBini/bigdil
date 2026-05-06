import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import type { Period } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

function HeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-slate-100 text-slate-600">{children}</tr>
}

function PeriodLabelStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-0.5">{children}</div>
}

function PeriodNumberLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold">{children}</span>
}

function PeriodDateLabel({ children }: { children: ReactNode }) {
  return <span className="text-[10px] font-normal opacity-70">{children}</span>
}

interface WorkGridHeaderProps {
  periods: Period[]
}

export function WorkGridHeader({ periods }: WorkGridHeaderProps) {
  return (
    <thead>
      <HeaderRow>
        <StickyColumnCell as="th" zIndex={30} shadowColor="#94a3b8" className="border-b border-slate-300 bg-slate-100 text-left font-semibold">
          Task / Phase
        </StickyColumnCell>

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
              <PeriodLabelStack>
                <PeriodNumberLabel>
                  W{period.periodNumber}
                  {(isFrozen || isConsolidation) && (
                    <Lock className="ml-0.5 inline-block size-2.5 opacity-60" />
                  )}
                </PeriodNumberLabel>
                <PeriodDateLabel>{formatShortDate(period.startDate)}</PeriodDateLabel>
              </PeriodLabelStack>
            </th>
          )
        })}
      </HeaderRow>
    </thead>
  )
}
