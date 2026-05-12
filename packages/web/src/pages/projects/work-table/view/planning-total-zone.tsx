import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  return (
    <div className="flex-1 min-w-[200px]">
      <ZoneTitle>{t('workTable.planningTotal.title')}</ZoneTitle>
      <VStack gap="md">
        <FormulaBlock
          label={t('workTable.planningTotal.cost')}
          value={formatCurrency(data.tcAmount)}
          formula={t('workTable.planningTotal.costFormula', { days: formatDays(data.tcTotalDays) })}
        />
        <FormulaBlock
          label={t('workTable.planningTotal.revenue')}
          value={formatCurrency(data.trAmount)}
          formula={t('workTable.planningTotal.revenueFormula', { days: formatDays(data.trDaysSold), rate: formatCurrency(sellRate) })}
        />

        <MarginRow
          value={<>
            <ColorValue value={data.trMargin} format="currency" />
            {data.trMarginPct != null && <MarginPctSuffix>{data.trMarginPct.toFixed(1)}%</MarginPctSuffix>}
          </>}
          formula={t('workTable.planningTotal.marginFormula', { revenue: formatCurrency(data.trAmount), cost: formatCurrency(data.tcAmount) })}
        />
      </VStack>
    </div>
  )
}
