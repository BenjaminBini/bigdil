import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineItem } from '@/components/shared/timeline-item'
import { ErrorState } from '@/components/shared/page-container'
import { formatDate } from '@/lib/format'
import type { PeriodInfo } from '@/api/types'

interface ProjectActivityTimelineProps {
  periods: PeriodInfo[]
}

export function ProjectActivityTimeline({ periods }: ProjectActivityTimelineProps) {
  const timeline = periods
    .filter((period) => period.status === 'FROZEN' && period.frozenAt)
    .sort((a, b) => (b.frozenAt! > a.frozenAt! ? 1 : -1))
    .map((period) => ({
      id: period.code,
      label: `Period ${period.label} closed`,
      date: formatDate(period.frozenAt!),
    }))

  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <ErrorState variant="empty" message="No closed periods yet." />
        ) : (
          <div>
            {timeline.map((event) => (
              <TimelineItem
                key={event.id}
                icon={<CheckCircle2 size={16} className="text-muted-foreground" />}
                label={event.label}
                sub={event.date}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
