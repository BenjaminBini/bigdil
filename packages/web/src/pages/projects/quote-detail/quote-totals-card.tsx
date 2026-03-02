import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/kpi-card'
import { formatCurrency } from '@/lib/format'
import type { QuoteGridRow } from './model'

interface QuoteTotalsCardProps {
  totalRow: QuoteGridRow
}

export function QuoteTotalsCard({ totalRow }: QuoteTotalsCardProps) {
  return (
    <Card variant="muted" className="p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KpiCard label="Total Days" value={String(totalRow.days)} className="border-0 bg-transparent p-0 shadow-none" />
        <KpiCard label="Revenue (ex-VAT)" value={formatCurrency(totalRow.revenue)} className="border-0 bg-transparent p-0 shadow-none" />
        <KpiCard label="Budget Cost" value={formatCurrency(totalRow.cost)} valueClassName="text-gray-600" className="border-0 bg-transparent p-0 shadow-none" />
        <KpiCard label="Margin" value={formatCurrency(totalRow.margin)} valueClassName="text-gray-800" className="border-0 bg-transparent p-0 shadow-none" />
        <KpiCard label="Margin %" value={`${totalRow.marginPct?.toFixed(1)}%`} valueClassName="text-gray-800" className="border-0 bg-transparent p-0 shadow-none" />
      </div>
    </Card>
  )
}
