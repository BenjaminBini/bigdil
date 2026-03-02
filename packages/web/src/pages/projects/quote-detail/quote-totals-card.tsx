import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/kpi-card'
import { formatCurrency } from '@/lib/format'
import type { QuoteGridRow } from './model'

interface QuoteTotalsCardProps {
  totalRow: QuoteGridRow
}

export function QuoteTotalsCard({ totalRow }: QuoteTotalsCardProps) {
  return (
    <Card variant="muted">
      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-5">
        <KpiCard label="Total Days" value={String(totalRow.days)} variant="inline" />
        <KpiCard label="Revenue (ex-VAT)" value={formatCurrency(totalRow.revenue)} variant="inline" />
        <KpiCard label="Budget Cost" value={formatCurrency(totalRow.cost)} variant="inline" />
        <KpiCard label="Margin" value={formatCurrency(totalRow.margin)} variant="inline" />
        <KpiCard label="Margin %" value={`${totalRow.marginPct?.toFixed(1)}%`} variant="inline" />
      </div>
    </Card>
  )
}
