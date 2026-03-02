import type { ReactNode } from 'react'
import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { DashboardData } from '@/api/types'

interface KpiStripProps {
  kpis: DashboardData['kpis']
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Contract Value"
        value={formatCurrency(kpis.totalContractValue)}
        subtitle="Across all validated quotes"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        title="Total Margin Forecast"
        value={formatCurrency(kpis.totalMarginForecast)}
        subtitle="From latest snapshots"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        title="Active Projects"
        value={String(kpis.activeProjects)}
        subtitle="Currently in progress"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        title="Pending Approvals"
        value={String(kpis.overdueApprovals)}
        subtitle="Timesheets awaiting approval"
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}

interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
}

function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
