import type { ProfileTaskPeriodStart } from '@/api/types'
import { formatCurrency, formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FrozenData, GridRow } from './types'

interface PlanningDetailCardProps {
  row: GridRow
  frozenData: FrozenData | null
  periodStart: ProfileTaskPeriodStart | null
}

export function PlanningDetailCard({ row, frozenData: fd, periodStart }: PlanningDetailCardProps) {
  const soldDays = row.quotedDays
  const spentDays = row.totalActual
  const remainingDays = row.totalRemaining
  const spentPct = soldDays > 0 ? Math.min((spentDays / soldDays) * 100, 100) : 0

  const fmtDays = (d: number) => (d === 0 ? '0' : formatDays(d))
  const fmtCur = (n: number) => (n === 0 ? '0 €' : formatCurrency(n))

  const zoneTitleClass = 'mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400'
  const rowClass = 'flex items-baseline justify-between text-xs'
  const labelClass = 'text-slate-500'
  const valueClass = 'font-mono font-medium text-slate-700'
  const marginValueClass = 'font-mono font-semibold'
  const formulaClass = 'text-[9px] italic text-slate-400'

  if (!fd) {
    return <div className="text-xs text-slate-400">—</div>
  }

  const sellRate = fd.trDailyRate ?? 0
  const prevRemaining = periodStart?.remainingAtStart ?? remainingDays + fd.prDaysProduced
  const prevSold = periodStart?.soldAtStart ?? soldDays
  const scopeChangeDays = soldDays - prevSold
  const hasScopeChange = scopeChangeDays !== 0
  const scopeChangeValue = scopeChangeDays * sellRate
  const daysProduced = prevRemaining - remainingDays - (hasScopeChange ? scopeChangeDays : 0)
  const production = daysProduced * sellRate
  const periodMargin = production - fd.pcAmount

  return (
    <div className="flex gap-6">
      <div className="min-w-[180px] flex-1">
        <div className={zoneTitleClass}>Planning</div>
        <div className="space-y-1">
          <MetricLine label="Sold" value={fmtDays(soldDays)} rowClass={rowClass} labelClass={labelClass} valueClass={valueClass} />
          <MetricLine label="Spent" value={fmtDays(spentDays)} rowClass={rowClass} labelClass={labelClass} valueClass={valueClass} />
          <MetricLine label="Remaining" value={fmtDays(remainingDays)} rowClass={rowClass} labelClass={labelClass} valueClass={valueClass} />
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
          <div className="h-1 rounded-full bg-blue-500 transition-all" style={{ width: `${spentPct}%` }} />
        </div>
      </div>

      <div className="w-px bg-slate-200" />

      <div className="min-w-[200px] flex-1">
        <div className={zoneTitleClass}>Total</div>
        <div className="space-y-2">
          <FormulaBlock
            label="Cost"
            value={fmtCur(fd.tcAmount)}
            formula={`= ${fmtDays(fd.tcTotalDays)}d (spent+rem.) × avg cost/d`}
            rowClass={rowClass}
            labelClass={labelClass}
            valueClass={valueClass}
            formulaClass={formulaClass}
          />
          <FormulaBlock
            label="Revenue"
            value={fmtCur(fd.trAmount)}
            formula={`= ${fmtDays(fd.trDaysSold)}d (sold) × ${fmtCur(sellRate)}/d`}
            rowClass={rowClass}
            labelClass={labelClass}
            valueClass={valueClass}
            formulaClass={formulaClass}
          />
          <div>
            <div className={rowClass}>
              <span className={labelClass}>Margin</span>
              <span className={cn(marginValueClass, fd.trMargin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {fmtCur(fd.trMargin)}
                {fd.trMarginPct != null && <span className="ml-0.5 text-[9px] opacity-70">{fd.trMarginPct.toFixed(1)}%</span>}
              </span>
            </div>
            <div className={formulaClass}>
              = {fmtCur(fd.trAmount)} (rev.) - {fmtCur(fd.tcAmount)} (cost)
            </div>
          </div>
        </div>
      </div>

      <div className="w-px bg-slate-200" />

      <div className="min-w-[240px] flex-1">
        <div className={zoneTitleClass}>Period</div>
        <div className="space-y-2">
          <FormulaBlock
            label="Cost"
            value={fmtCur(fd.pcAmount)}
            formula={`= ${fmtDays(fd.pcDaysSpent)}d (spent in period) × avg cost/d`}
            rowClass={rowClass}
            labelClass={labelClass}
            valueClass={valueClass}
            formulaClass={formulaClass}
          />

          {hasScopeChange && (
            <FormulaBlock
              label="Scope change"
              value={fmtCur(scopeChangeValue)}
              formula={`= ${fmtDays(scopeChangeDays)}d (new scope) × ${fmtCur(sellRate)}/d`}
              rowClass={rowClass}
              labelClass={labelClass}
              valueClass={valueClass}
              formulaClass={formulaClass}
            />
          )}

          <FormulaBlock
            label="Days produced"
            value={fmtDays(daysProduced)}
            formula={`= ${fmtDays(prevRemaining)}d (rem.t-1) - ${fmtDays(remainingDays)}d (rem.t)${
              hasScopeChange ? ` - ${fmtDays(scopeChangeDays)}d (scope)` : ''
            }`}
            rowClass={rowClass}
            labelClass={labelClass}
            valueClass={valueClass}
            formulaClass={formulaClass}
          />
          <FormulaBlock
            label="Production"
            value={fmtCur(production)}
            formula={`= ${fmtDays(daysProduced)}d (produced) × ${fmtCur(sellRate)}/d`}
            rowClass={rowClass}
            labelClass={labelClass}
            valueClass={valueClass}
            formulaClass={formulaClass}
          />

          <div>
            <div className={rowClass}>
              <span className={labelClass}>Margin</span>
              <span className={cn(marginValueClass, periodMargin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {fmtCur(periodMargin)}
                {production !== 0 && <span className="ml-0.5 text-[9px] opacity-70">{((periodMargin / production) * 100).toFixed(1)}%</span>}
              </span>
            </div>
            <div className={formulaClass}>
              = {fmtCur(production)} (prod.) - {fmtCur(fd.pcAmount)} (cost)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricLineProps {
  label: string
  value: string
  rowClass: string
  labelClass: string
  valueClass: string
}

function MetricLine({ label, value, rowClass, labelClass, valueClass }: MetricLineProps) {
  return (
    <div className={rowClass}>
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

interface FormulaBlockProps {
  label: string
  value: string
  formula: string
  rowClass: string
  labelClass: string
  valueClass: string
  formulaClass: string
}

function FormulaBlock({
  label,
  value,
  formula,
  rowClass,
  labelClass,
  valueClass,
  formulaClass,
}: FormulaBlockProps) {
  return (
    <div>
      <div className={rowClass}>
        <span className={labelClass}>{label}</span>
        <span className={valueClass}>{value}</span>
      </div>
      <div className={formulaClass}>{formula}</div>
    </div>
  )
}
