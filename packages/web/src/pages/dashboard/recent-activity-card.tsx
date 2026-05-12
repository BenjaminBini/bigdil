import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivity.title')}</CardTitle>
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
                    <span className="text-muted-foreground"> — {t('dashboard.recentActivity.periodClosed', { periodNumber: activity.periodNumber })}</span>
                  </>
                }
                sub={formatDate(activity.snapshotAt)}
              />
            )
          })}
          {recentActivity.length === 0 && <MutedText>{t('dashboard.recentActivity.noRecent')}</MutedText>}
        </div>
      </CardContent>
    </Card>
  )
}
