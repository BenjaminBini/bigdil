import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { KpiCard } from '@/components/shared/kpi-card'
import { formatCurrency } from '@/lib/format'
import type { DashboardData } from '@/api/types'

interface KpiStripProps {
  kpis: DashboardData['kpis']
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total Contract Value"
        value={formatCurrency(kpis.totalContractValue)}
        description="Across all validated quotes"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        label="Total Margin Forecast"
        value={formatCurrency(kpis.totalMarginForecast)}
        description="From latest snapshots"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        label="Active Projects"
        value={String(kpis.activeProjects)}
        description="Currently in progress"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        label="Pending Approvals"
        value={String(kpis.overdueApprovals)}
        description="Timesheets awaiting approval"
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
