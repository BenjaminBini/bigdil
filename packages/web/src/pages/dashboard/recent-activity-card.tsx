import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineItem } from '@/components/shared/timeline-item'
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
        <div>
          {recentActivity.map((activity) => {
            const projectName = projects?.find((project) => project.id === activity.projectId)?.name ?? activity.projectId
            return (
              <TimelineItem
                key={activity.id}
                label={
                  <>
                    <span className="font-medium">{projectName}</span>
                    <span className="text-muted-foreground"> - Period {activity.periodNumber} closed</span>
                  </>
                }
                sub={formatDate(activity.snapshotAt)}
              />
            )
          })}
          {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
        </div>
      </CardContent>
    </Card>
  )
}
