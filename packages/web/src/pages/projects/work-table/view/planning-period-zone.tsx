import { FormulaBlock, ZoneTitle, MarginRow, MarginPctSuffix } from '@/components/shared/metric-display'
import { ColorValue } from '@/components/shared/color-value'
import { VStack } from '@/components/shared/VStack'

interface PlanningPeriodZoneProps {
  remainingDays: number
  periodCost: number
  periodDaysSpent: number
  sellRate: number
  prevRemaining: number
  scopeChangeDays: number
  hasScopeChange: boolean
  scopeChangeValue: number
  daysProduced: number
  production: number
  periodMargin: number
  formatDays: (days: number) => string
  formatCurrency: (value: number) => string
}

export function PlanningPeriodZone({
  remainingDays,
  periodCost,
  periodDaysSpent,
  sellRate,
  prevRemaining,
  scopeChangeDays,
  hasScopeChange,
  scopeChangeValue,
  daysProduced,
  production,
  periodMargin,
  formatDays,
  formatCurrency,
}: PlanningPeriodZoneProps) {
  return (
    <div className="flex-1 min-w-[240px]">
      <ZoneTitle>Period</ZoneTitle>
      <VStack gap="md">
        <FormulaBlock
          label="Cost"
          value={formatCurrency(periodCost)}
          formula={`= ${formatDays(periodDaysSpent)}d (spent in period) × avg cost/d`}
        />

        {hasScopeChange && (
          <FormulaBlock
            label="Scope change"
            value={formatCurrency(scopeChangeValue)}
            formula={`= ${formatDays(scopeChangeDays)}d (new scope) × ${formatCurrency(sellRate)}/d`}
          />
        )}

        <FormulaBlock
          label="Days produced"
          value={formatDays(daysProduced)}
          formula={`= ${formatDays(prevRemaining)}d (rem.t-1) - ${formatDays(remainingDays)}d (rem.t)${
            hasScopeChange ? ` - ${formatDays(scopeChangeDays)}d (scope)` : ''
          }`}
        />

        <FormulaBlock
          label="Production"
          value={formatCurrency(production)}
          formula={`= ${formatDays(daysProduced)}d (produced) × ${formatCurrency(sellRate)}/d`}
        />

        <MarginRow
          value={<>
            <ColorValue value={periodMargin} format="currency" />
            {production !== 0 && <MarginPctSuffix>{((periodMargin / production) * 100).toFixed(1)}%</MarginPctSuffix>}
          </>}
          formula={`= ${formatCurrency(production)} (prod.) - ${formatCurrency(periodCost)} (cost)`}
        />
      </VStack>
    </div>
  )
}
