import { cn } from '@/lib/utils'
import type { FrozenData } from '@/pages/projects/work-table/types'
import { FormulaBlock, PLANNING_DETAIL_CLASSES } from './planning-detail-shared'

interface PlanningTotalZoneProps {
  data: FrozenData
  sellRate: number
  formatDays: (days: number) => string
  formatCurrency: (value: number) => string
}

export function PlanningTotalZone({ data, sellRate, formatDays, formatCurrency }: PlanningTotalZoneProps) {
  return (
    <div className="min-w-[200px] flex-1">
      <div className={PLANNING_DETAIL_CLASSES.zoneTitle}>Total</div>
      <div className="space-y-2">
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

        <div>
          <div className={PLANNING_DETAIL_CLASSES.row}>
            <span className={PLANNING_DETAIL_CLASSES.label}>Margin</span>
            <span className={cn(PLANNING_DETAIL_CLASSES.marginValue, data.trMargin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {formatCurrency(data.trMargin)}
              {data.trMarginPct != null && <span className="ml-0.5 text-[9px] opacity-70">{data.trMarginPct.toFixed(1)}%</span>}
            </span>
          </div>
          <div className={PLANNING_DETAIL_CLASSES.formula}>
            = {formatCurrency(data.trAmount)} (rev.) - {formatCurrency(data.tcAmount)} (cost)
          </div>
        </div>
      </div>
    </div>
  )
}
