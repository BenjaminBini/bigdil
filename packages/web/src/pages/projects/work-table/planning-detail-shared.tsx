import { cn } from '@/lib/utils'

export const PLANNING_DETAIL_CLASSES = {
  zoneTitle: 'mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400',
  row: 'flex items-baseline justify-between text-xs',
  label: 'text-slate-500',
  value: 'font-mono font-medium text-slate-700',
  marginValue: 'font-mono font-semibold',
  formula: 'text-[9px] italic text-slate-400',
}

interface MetricLineProps {
  label: string
  value: string
}

export function MetricLine({ label, value }: MetricLineProps) {
  return (
    <div className={PLANNING_DETAIL_CLASSES.row}>
      <span className={PLANNING_DETAIL_CLASSES.label}>{label}</span>
      <span className={PLANNING_DETAIL_CLASSES.value}>{value}</span>
    </div>
  )
}

interface FormulaBlockProps {
  label: string
  value: string
  formula: string
  valueClassName?: string
}

export function FormulaBlock({ label, value, formula, valueClassName }: FormulaBlockProps) {
  return (
    <div>
      <div className={PLANNING_DETAIL_CLASSES.row}>
        <span className={PLANNING_DETAIL_CLASSES.label}>{label}</span>
        <span className={cn(PLANNING_DETAIL_CLASSES.value, valueClassName)}>{value}</span>
      </div>
      <div className={PLANNING_DETAIL_CLASSES.formula}>{formula}</div>
    </div>
  )
}
