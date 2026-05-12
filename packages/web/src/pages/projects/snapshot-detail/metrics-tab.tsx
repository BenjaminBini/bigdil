import { useTranslation } from 'react-i18next'
import { KpiCard } from '@/components/shared/kpi-card'
import { KpiGrid } from '@/components/shared/layouts'
import { formatCurrency, formatDays } from '@/lib/format'
import type { SnapshotMetrics } from '@/api/types'
import type { KpiCardProps } from '@/components/shared/kpi-card'
import type { TFunction } from 'i18next'

function buildKpis(m: SnapshotMetrics, t: TFunction): KpiCardProps[] {
  const contractValue = m.contractValue
  const marginPct = contractValue > 0 ? (m.marginForecast / contractValue) * 100 : 0
  return [
    { label: t('snapshots.metrics.contractValue'), value: formatCurrency(m.contractValue) },
    { label: t('snapshots.metrics.actualCostToDate'), value: formatCurrency(m.actualCostToDate) },
    { label: t('snapshots.metrics.etcCost'), value: formatCurrency(m.etcCost) },
    { label: t('snapshots.metrics.eacCost'), value: formatCurrency(m.eacCost) },
    {
      label: t('snapshots.metrics.marginForecast'),
      value: formatCurrency(m.marginForecast),
      description: t('projectLayout.kpi.ofContract', { pct: marginPct.toFixed(1) }),
      variant: 'highlight',
    },
    {
      label: t('snapshots.metrics.executedDays'),
      value: formatDays(m.executedDaysPeriod),
      description: t('snapshots.metrics.thisPeriod'),
    },
    {
      label: t('snapshots.metrics.producedValuePeriod'),
      value: formatCurrency(m.producedExecutionValuePeriod),
      variant: 'highlight',
    },
    {
      label: t('snapshots.metrics.producedToDate'),
      value: formatCurrency(m.producedExecutionValueToDate),
    },
  ]
}

export function MetricsTab({ metrics }: { metrics: SnapshotMetrics }) {
  const { t } = useTranslation('pages')
  const kpis = buildKpis(metrics, t)
  return (
    <KpiGrid className="pt-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </KpiGrid>
  )
}
