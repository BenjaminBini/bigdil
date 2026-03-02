import { useDashboard, useProjects } from '@/api/hooks'
import { PageHeader } from '@/components/shared/page-header'
import { ActiveProjectsCard } from './dashboard/active-projects-card'
import { AlertsCard } from './dashboard/alerts-card'
import { KpiStrip } from './dashboard/kpi-strip'
import { RecentActivityCard } from './dashboard/recent-activity-card'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const { data: projects } = useProjects()

  if (isLoading) return <div className="p-6">Loading dashboard...</div>
  if (error || !data) return <div className="p-6">Error loading dashboard</div>

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Dashboard" subtitle="Cross-project overview" />
      <KpiStrip kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActiveProjectsCard projects={data.activeProjectsList} />
        <AlertsCard alerts={data.alerts} />
      </div>

      <RecentActivityCard recentActivity={data.recentActivity} projects={projects} />
    </div>
  )
}
