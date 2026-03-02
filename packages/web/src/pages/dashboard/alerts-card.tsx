import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardData } from '@/api/types'

interface AlertsCardProps {
  alerts: DashboardData['alerts']
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const hasNoAlerts = alerts.periodsNeedingClosure.length === 0 && alerts.overdueApprovals === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.periodsNeedingClosure.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Periods in Consolidation (ready to close)</h4>
            {alerts.periodsNeedingClosure.map((period) => (
              <Link
                key={period.periodId}
                to={`/projects/${period.projectId}/snapshots`}
                className="flex items-center justify-between rounded border p-2 text-sm transition-colors hover:bg-accent"
              >
                <span>
                  {period.projectName} - Period {period.periodNumber}
                </span>
                <Badge variant="outline" className="bg-amber-100 text-amber-700">
                  CONSOLIDATION
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {alerts.overdueApprovals > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Pending Approvals</h4>
            <Link
              to="/timesheets/approvals"
              className="flex items-center justify-between rounded border p-2 text-sm transition-colors hover:bg-accent"
            >
              <span>{alerts.overdueApprovals} timesheet(s) awaiting approval</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                Review
              </Badge>
            </Link>
          </div>
        )}

        {hasNoAlerts && <p className="text-sm text-muted-foreground">No alerts - everything is on track.</p>}
      </CardContent>
    </Card>
  )
}
