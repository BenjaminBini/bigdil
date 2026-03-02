import { MetricStrip } from '@/components/shared/metric-strip'
import { ColorValue } from '@/components/shared/color-value'
import { formatCurrency, formatDays } from '@/lib/format'
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
              <ColorValue
                value={`${totalToPlan > 0 ? '+' : ''}${formatDays(totalToPlan)}d`}
                sentiment={totalToPlan === 0 ? 'positive' : totalToPlan > 0 ? 'warning' : 'negative'}
                className="font-mono"
              />
            ),
          },
          {
            label: 'Project margin',
            value: grandTotalFrozen ? (
              <>
                <ColorValue value={grandTotalFrozen.trMargin} format="currency" className="font-mono" />
                {grandTotalFrozen.trMarginPct != null && (
                  <span className="ml-1 text-xs opacity-70">({grandTotalFrozen.trMarginPct.toFixed(1)}%)</span>
                )}
              </>
            ) : (
              <span className="text-slate-400">—</span>
            ),
          },
          {
            label: 'Period margin',
            value: grandTotalFrozen ? (
              <>
                <ColorValue value={grandTotalFrozen.prMargin} format="currency" className="font-mono" />
                {grandTotalFrozen.prMarginPct != null && (
                  <span className="ml-1 text-xs opacity-70">({grandTotalFrozen.prMarginPct.toFixed(1)}%)</span>
                )}
              </>
            ) : (
              <span className="text-slate-400">—</span>
            ),
          },
        ]}
      />
    </div>
  )
}
