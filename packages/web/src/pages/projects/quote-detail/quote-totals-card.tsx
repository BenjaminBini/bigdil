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
        <KpiCard label="Jours total" value={String(totalRow.days)} variant="inline" />
        <KpiCard label="CA HT" value={formatCurrency(totalRow.revenue)} variant="inline" />
        <KpiCard label="Coût budgété" value={formatCurrency(totalRow.cost)} variant="inline" />
        <KpiCard label="Marge" value={formatCurrency(totalRow.margin)} variant="inline" />
        <KpiCard label="Marge %" value={`${totalRow.marginPct?.toFixed(1)}%`} variant="inline" />
      </div>
    </Card>
  )
}
