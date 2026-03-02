import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <ol className="space-y-0">
            {timeline.map((event) => (
              <li key={event.id} className="flex gap-3 border-b border-gray-100 py-3 last:border-0">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{event.date}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
