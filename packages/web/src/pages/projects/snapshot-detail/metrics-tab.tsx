import { KpiCard } from '@/components/shared/kpi-card'
import { formatCurrency, formatDays } from '@/lib/format'
import type { SnapshotMetrics } from '@/api/types'
import type { KpiCardProps } from '@/components/shared/kpi-card'

function buildKpis(m: SnapshotMetrics): KpiCardProps[] {
  const contractValue = m.contractValue
  const marginPct = contractValue > 0 ? (m.marginForecast / contractValue) * 100 : 0
  return [
    { label: 'Contract Value', value: formatCurrency(m.contractValue) },
    { label: 'Actual Cost to Date', value: formatCurrency(m.actualCostToDate) },
    { label: 'ETC Cost', value: formatCurrency(m.etcCost) },
    { label: 'EAC Cost', value: formatCurrency(m.eacCost) },
    {
      label: 'Margin Forecast',
      value: formatCurrency(m.marginForecast),
      description: `${marginPct.toFixed(1)}% of contract`,
      variant: 'highlight',
    },
    {
      label: 'Executed Days',
      value: `${formatDays(m.executedDaysPeriod)} days`,
      description: 'This period',
    },
    {
      label: 'Produced Value (period)',
      value: formatCurrency(m.producedExecutionValuePeriod),
      variant: 'highlight',
    },
    {
      label: 'Produced to Date',
      value: formatCurrency(m.producedExecutionValueToDate),
    },
  ]
}

export function MetricsTab({ metrics }: { metrics: SnapshotMetrics }) {
  const kpis = buildKpis(metrics)
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}
