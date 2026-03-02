import { formatCurrency } from '@/lib/format'
import type { QuoteGridRow } from './model'

interface QuoteTotalsCardProps {
  totalRow: QuoteGridRow
}

export function QuoteTotalsCard({ totalRow }: QuoteTotalsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Metric label="Total Days" value={String(totalRow.days)} />
        <Metric label="Revenue (ex-VAT)" value={formatCurrency(totalRow.revenue)} />
        <Metric label="Budget Cost" value={formatCurrency(totalRow.cost)} valueClassName="text-gray-600" />
        <Metric label="Margin" value={formatCurrency(totalRow.margin)} valueClassName="text-gray-800" />
        <Metric label="Margin %" value={`${totalRow.marginPct?.toFixed(1)}%`} valueClassName="text-gray-800" />
      </div>
    </div>
  )
}

interface MetricProps {
  label: string
  value: string
  valueClassName?: string
}

function Metric({ label, value, valueClassName }: MetricProps) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold tabular-nums text-gray-900 ${valueClassName ?? ''}`}>{value}</p>
    </div>
  )
}
