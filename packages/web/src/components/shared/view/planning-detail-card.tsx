import type { ProfileTaskPeriodStart } from '@/api/types'
import { formatCurrency, formatDays } from '@/lib/format'
import { PlanningPeriodZone } from './planning-period-zone'
import { PlanningZone } from './planning-zone'
import { PlanningTotalZone } from './planning-total-zone'
import type { FrozenData, GridRow } from '@/pages/projects/work-table/types'

interface PlanningDetailCardProps {
  row: GridRow
  frozenData: FrozenData | null
  periodStart: ProfileTaskPeriodStart | null
}

export function PlanningDetailCard({ row, frozenData, periodStart }: PlanningDetailCardProps) {
  if (!frozenData) return <div className="text-xs text-slate-400">—</div>

  const soldDays = row.quotedDays
  const spentDays = row.totalActual
  const remainingDays = row.totalRemaining
  const spentPct = soldDays > 0 ? Math.min((spentDays / soldDays) * 100, 100) : 0

  const sellRate = frozenData.trDailyRate ?? 0
  const prevRemaining = periodStart?.remainingAtStart ?? remainingDays + frozenData.prDaysProduced
  const prevSold = periodStart?.soldAtStart ?? soldDays
  const scopeChangeDays = soldDays - prevSold
  const hasScopeChange = scopeChangeDays !== 0
  const scopeChangeValue = scopeChangeDays * sellRate
  const daysProduced = prevRemaining - remainingDays - (hasScopeChange ? scopeChangeDays : 0)
  const production = daysProduced * sellRate
  const periodMargin = production - frozenData.pcAmount

  const fmtDays = (days: number) => (days === 0 ? '0' : formatDays(days))
  const fmtCurrency = (value: number) => (value === 0 ? '0 €' : formatCurrency(value))

  return (
    <div className="flex gap-6">
      <PlanningZone
        soldDays={soldDays}
        spentDays={spentDays}
        remainingDays={remainingDays}
        spentPct={spentPct}
        formatDays={fmtDays}
      />

      <div className="w-px bg-slate-200" />

      <PlanningTotalZone
        data={frozenData}
        sellRate={sellRate}
        formatDays={fmtDays}
        formatCurrency={fmtCurrency}
      />

      <div className="w-px bg-slate-200" />

      <PlanningPeriodZone
        remainingDays={remainingDays}
        periodCost={frozenData.pcAmount}
        periodDaysSpent={frozenData.pcDaysSpent}
        sellRate={sellRate}
        prevRemaining={prevRemaining}
        scopeChangeDays={scopeChangeDays}
        hasScopeChange={hasScopeChange}
        scopeChangeValue={scopeChangeValue}
        daysProduced={daysProduced}
        production={production}
        periodMargin={periodMargin}
        formatDays={fmtDays}
        formatCurrency={fmtCurrency}
      />
    </div>
  )
}
