import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { KpiCard } from '@/components/shared/kpi-card'
import { KpiGrid } from '@/components/shared/layouts'
import { formatCurrency } from '@/lib/format'
import type { DashboardData } from '@/api/types'

interface KpiStripProps {
  kpis: DashboardData['kpis']
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <KpiGrid>
      <KpiCard
        label="Total Contract Value"
        value={formatCurrency(kpis.totalContractValue)}
        description="Across all validated quotes"
        icon={<BarChart3 size={16} />}
      />
      <KpiCard
        label="Total Margin Forecast"
        value={formatCurrency(kpis.totalMarginForecast)}
        description="From latest snapshots"
        icon={<TrendingUp size={16} />}
      />
      <KpiCard
        label="Active Projects"
        value={String(kpis.activeProjects)}
        description="Currently in progress"
        icon={<Activity size={16} />}
      />
      <KpiCard
        label="Pending Approvals"
        value={String(kpis.overdueApprovals)}
        description="Timesheets awaiting approval"
        icon={<AlertTriangle size={16} />}
      />
    </KpiGrid>
  )
}
