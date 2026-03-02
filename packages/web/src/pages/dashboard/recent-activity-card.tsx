import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import type { DashboardData, ProjectListItem } from '@/api/types'

interface RecentActivityCardProps {
  recentActivity: DashboardData['recentActivity']
  projects?: ProjectListItem[]
}

export function RecentActivityCard({ recentActivity, projects }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentActivity.map((activity) => {
            const projectName = projects?.find((project) => project.id === activity.projectId)?.name ?? activity.projectId
            return (
              <div key={activity.id} className="flex items-center justify-between border-b p-2 text-sm last:border-b-0">
                <div>
                  <span className="font-medium">{projectName}</span>
                  <span className="text-muted-foreground"> - Period {activity.periodNumber} closed</span>
                </div>
                <span className="text-muted-foreground">{formatDate(activity.snapshotAt)}</span>
              </div>
            )
          })}
          {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
        </div>
      </CardContent>
    </Card>
  )
}
