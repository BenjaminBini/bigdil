import { cn } from '@/lib/utils'
import { formatCurrency, formatDays } from '@/lib/format'
import type { SnapshotMetrics } from '@/api/types'

interface SnapshotMetricCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  dim?: boolean
}

function SnapshotMetricCard({ label, value, sub, highlight, dim }: SnapshotMetricCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-lg border px-4 py-3 bg-white',
        highlight && 'border-green-200 bg-green-50',
        dim && 'opacity-60',
      )}
    >
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</span>
      <span
        className={cn(
          'text-lg font-semibold leading-tight tabular-nums',
          highlight ? 'text-green-700' : 'text-gray-900',
          dim && 'text-gray-400',
        )}
      >
        {value}
      </span>
      {sub && (
        <span className={cn('text-xs', highlight ? 'text-green-600' : 'text-gray-500')}>
          {sub}
        </span>
      )}
    </div>
  )
}

function buildKpis(m: SnapshotMetrics): SnapshotMetricCardProps[] {
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
      sub: `${marginPct.toFixed(1)}% of contract`,
      highlight: true,
    },
    {
      label: 'Executed Days',
      value: `${formatDays(m.executedDaysPeriod)} days`,
      sub: 'This period',
    },
    {
      label: 'Produced Value (period)',
      value: formatCurrency(m.producedExecutionValuePeriod),
      highlight: true,
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
        <SnapshotMetricCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}
