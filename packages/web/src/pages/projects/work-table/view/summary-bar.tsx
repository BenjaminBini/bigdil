import { MetricStrip } from '@/components/shared/metric-strip'
import { ColorValue } from '@/components/shared/color-value'
import { NullCell } from '@/components/shared/table-cells'
import { BottomBar } from '@/components/shared/layouts'
import { MarginPctSuffix } from '@/components/shared/metric-display'
import { formatDays } from '@/lib/format'
import type { FrozenData } from '@/lib/work-table/types'

interface SummaryBarProps {
  totalToPlan: number
  grandTotalFrozen?: FrozenData
}

export function SummaryBar({ totalToPlan, grandTotalFrozen }: SummaryBarProps) {
  return (
    <BottomBar size="sm">
      <MetricStrip
        items={[
          {
            label: 'To plan',
            value: (
              <ColorValue
                value={`${totalToPlan > 0 ? '+' : ''}${formatDays(totalToPlan)}d`}
                sentiment={totalToPlan === 0 ? 'positive' : totalToPlan > 0 ? 'warning' : 'negative'}
                mono
              />
            ),
          },
          {
            label: 'Project margin',
            value: grandTotalFrozen ? (
              <>
                <ColorValue value={grandTotalFrozen.trMargin} format="currency" mono />
                {grandTotalFrozen.trMarginPct != null && (
                  <MarginPctSuffix>({grandTotalFrozen.trMarginPct.toFixed(1)}%)</MarginPctSuffix>
                )}
              </>
            ) : (
              <NullCell />
            ),
          },
          {
            label: 'Period margin',
            value: grandTotalFrozen ? (
              <>
                <ColorValue value={grandTotalFrozen.prMargin} format="currency" mono />
                {grandTotalFrozen.prMarginPct != null && (
                  <MarginPctSuffix>({grandTotalFrozen.prMarginPct.toFixed(1)}%)</MarginPctSuffix>
                )}
              </>
            ) : (
              <NullCell />
            ),
          },
        ]}
      />
    </BottomBar>
  )
}
