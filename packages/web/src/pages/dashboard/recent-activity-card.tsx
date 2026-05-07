import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineItem } from '@/components/shared/timeline-item'
import { MutedText } from '@/components/shared/muted-text'
import { TextStrong } from '@/components/shared/text-strong'
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
        <CardTitle>Activité récente</CardTitle>
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
                    <TextStrong>{projectName}</TextStrong>
                    <span className="text-muted-foreground"> — Période {activity.periodNumber} clôturée</span>
                  </>
                }
                sub={formatDate(activity.snapshotAt)}
              />
            )
          })}
          {recentActivity.length === 0 && <MutedText>Aucune activité récente</MutedText>}
        </div>
      </CardContent>
    </Card>
  )
}
