import { Link } from 'react-router'
import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { useDashboard, useProjects } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import { projectStatusColors } from '@/lib/constants'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const { data: projects } = useProjects()

  if (isLoading) return <div className="p-6">Loading dashboard...</div>
  if (error || !data) return <div className="p-6">Error loading dashboard</div>

  const { kpis, activeProjectsList, recentActivity, alerts } = data

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dashboard" subtitle="Cross-project overview" />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalContractValue)}</div>
            <p className="text-xs text-muted-foreground">Across all validated quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Margin Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalMarginForecast)}</div>
            <p className="text-xs text-muted-foreground">From latest snapshots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.overdueApprovals}</div>
            <p className="text-xs text-muted-foreground">Timesheets awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeProjectsList.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">{project.clientName}</div>
                  </div>
                  <Badge className={projectStatusColors[project.status]}>{project.status}</Badge>
                </Link>
              ))}
              {activeProjectsList.length === 0 && (
                <p className="text-sm text-muted-foreground">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.periodsNeedingClosure.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Periods in Consolidation (ready to close)</h4>
                {alerts.periodsNeedingClosure.map(p => (
                  <Link
                    key={p.periodId}
                    to={`/projects/${p.projectId}/snapshots`}
                    className="flex items-center justify-between p-2 rounded border hover:bg-accent transition-colors text-sm"
                  >
                    <span>{p.projectName} — Period {p.periodNumber}</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700">CONSOLIDATION</Badge>
                  </Link>
                ))}
              </div>
            )}
            {alerts.overdueApprovals > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Pending Approvals</h4>
                <Link
                  to="/timesheets/approvals"
                  className="flex items-center justify-between p-2 rounded border hover:bg-accent transition-colors text-sm"
                >
                  <span>{alerts.overdueApprovals} timesheet(s) awaiting approval</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">Review</Badge>
                </Link>
              </div>
            )}
            {alerts.periodsNeedingClosure.length === 0 && alerts.overdueApprovals === 0 && (
              <p className="text-sm text-muted-foreground">No alerts — everything is on track.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.map(activity => {
              const projectName = projects?.find(p => p.id === activity.projectId)?.name ?? activity.projectId
              return (
                <div key={activity.id} className="flex items-center justify-between p-2 text-sm border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{projectName}</span>
                    <span className="text-muted-foreground"> — Period {activity.periodNumber} closed</span>
                  </div>
                  <span className="text-muted-foreground">{formatDate(activity.snapshotAt)}</span>
                </div>
              )
            })}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
