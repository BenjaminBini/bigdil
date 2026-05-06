import type { FrozenData } from '@/lib/work-table/types'
import { FormulaBlock, ZoneTitle, MarginRow, MarginPctSuffix } from '@/components/shared/metric-display'
import { ColorValue } from '@/components/shared/color-value'
import { VStack } from '@/components/shared/VStack'

interface PlanningTotalZoneProps {
  data: FrozenData
  sellRate: number
  formatDays: (days: number) => string
  formatCurrency: (value: number) => string
}

export function PlanningTotalZone({ data, sellRate, formatDays, formatCurrency }: PlanningTotalZoneProps) {
  return (
    <div className="flex-1 min-w-[200px]">
      <ZoneTitle>Total</ZoneTitle>
      <VStack gap="md">
        <FormulaBlock
          label="Cost"
          value={formatCurrency(data.tcAmount)}
          formula={`= ${formatDays(data.tcTotalDays)}d (spent+rem.) × avg cost/d`}
        />
        <FormulaBlock
          label="Revenue"
          value={formatCurrency(data.trAmount)}
          formula={`= ${formatDays(data.trDaysSold)}d (sold) × ${formatCurrency(sellRate)}/d`}
        />

        <MarginRow
          value={<>
            <ColorValue value={data.trMargin} format="currency" />
            {data.trMarginPct != null && <MarginPctSuffix>{data.trMarginPct.toFixed(1)}%</MarginPctSuffix>}
          </>}
          formula={`= ${formatCurrency(data.trAmount)} (rev.) - ${formatCurrency(data.tcAmount)} (cost)`}
        />
      </VStack>
    </div>
  )
}
