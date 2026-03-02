import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineItem } from '@/components/shared/timeline-item'
import { formatDate } from '@/lib/format'
import type { Period } from '@/api/types'

interface ProjectActivityTimelineProps {
  periods: Period[]
}

export function ProjectActivityTimeline({ periods }: ProjectActivityTimelineProps) {
  const timeline = periods
    .filter((period) => period.status === 'FROZEN' && period.frozenAt)
    .sort((a, b) => (b.frozenAt! > a.frozenAt! ? 1 : -1))
    .map((period) => ({
      id: period.id,
      label: `Period ${period.periodNumber} closed`,
      date: formatDate(period.frozenAt),
    }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {timeline.length === 0 ? (
          <p className="py-4 text-sm text-gray-400">No closed periods yet.</p>
        ) : (
          <div>
            {timeline.map((event) => (
              <TimelineItem
                key={event.id}
                icon={<CheckCircle2 className="size-4 text-gray-500" />}
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
