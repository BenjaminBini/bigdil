import { cn } from '@/lib/utils'
import { FormulaBlock, PLANNING_DETAIL_CLASSES } from './planning-detail-shared'

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
    <div className="min-w-[240px] flex-1">
      <div className={PLANNING_DETAIL_CLASSES.zoneTitle}>Period</div>
      <div className="space-y-2">
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

        <div>
          <div className={PLANNING_DETAIL_CLASSES.row}>
            <span className={PLANNING_DETAIL_CLASSES.label}>Margin</span>
            <span className={cn(PLANNING_DETAIL_CLASSES.marginValue, periodMargin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {formatCurrency(periodMargin)}
              {production !== 0 && <span className="ml-0.5 text-[9px] opacity-70">{((periodMargin / production) * 100).toFixed(1)}%</span>}
            </span>
          </div>
          <div className={PLANNING_DETAIL_CLASSES.formula}>
            = {formatCurrency(production)} (prod.) - {formatCurrency(periodCost)} (cost)
          </div>
        </div>
      </div>
    </div>
  )
}
