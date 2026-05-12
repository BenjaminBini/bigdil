import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KpiCard } from '@/components/shared/kpi-card'
import { KpiGrid } from '@/components/shared/layouts'
import { formatCurrency } from '@/lib/format'
import type { DashboardData } from '@/api/types'

interface KpiStripProps {
  kpis: DashboardData['kpis']
}

export function KpiStrip({ kpis }: KpiStripProps) {
  const { t } = useTranslation('pages')
  return (
    <KpiGrid>
      <KpiCard
        label={t('dashboard.kpi.totalContractValue')}
        value={formatCurrency(kpis.totalContractValue)}
        description={t('dashboard.kpi.totalContractDescription')}
        icon={<BarChart3 size={16} />}
      />
      <KpiCard
        label={t('dashboard.kpi.totalMargin')}
        value={formatCurrency(kpis.totalMarginForecast)}
        description={t('dashboard.kpi.totalMarginDescription')}
        icon={<TrendingUp size={16} />}
      />
      <KpiCard
        label={t('dashboard.kpi.activeProjects')}
        value={String(kpis.activeProjects)}
        description={t('dashboard.kpi.activeProjectsDescription')}
        icon={<Activity size={16} />}
      />
      <KpiCard
        label={t('dashboard.kpi.overdueApprovals')}
        value={String(kpis.overdueApprovals)}
        description={t('dashboard.kpi.overdueApprovalsDescription')}
        icon={<AlertTriangle size={16} />}
      />
    </KpiGrid>
  )
}
