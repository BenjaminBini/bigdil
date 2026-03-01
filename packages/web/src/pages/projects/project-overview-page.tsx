import { useParams } from 'react-router'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProject } from '@/api/hooks'
import { formatDate } from '@/lib/format'
import { projectStatusColors, projectStatusLabels } from '@/lib/constants'
import type { Period } from '@/api/types'

// ---- Detail row ----

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// ---- Timeline event ----

interface TimelineEvent {
  label: string
  date: string
  type: 'closed' | 'change-order' | 'start' | 'validated'
}

const timelineIcons: Record<TimelineEvent['type'], React.ReactNode> = {
  closed: <CheckCircle2 className="size-4 text-gray-500 mt-0.5 shrink-0" />,
  'change-order': <Circle className="size-4 text-amber-500 mt-0.5 shrink-0" />,
  start: <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />,
  validated: <CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" />,
}

// Build a timeline from periods: list frozen periods most-recent-first.
function buildTimelineFromPeriods(periods: Period[]): TimelineEvent[] {
  const frozen = periods
    .filter((p) => p.status === 'FROZEN' && p.frozenAt)
    .sort((a, b) => (b.frozenAt! > a.frozenAt! ? 1 : -1))

  return frozen.map((p) => ({
    label: `Period ${p.periodNumber} closed`,
    date: formatDate(p.frozenAt),
    type: 'closed' as const,
  }))
}

// ---- Period progress card ----

function PeriodProgressCard({ periods }: { periods: Period[] }) {
  const totalPeriods = periods.length
  const frozenPeriods = periods.filter((p) => p.status === 'FROZEN').length
  const activePeriod = periods.find((p) => p.status === 'OPEN' || p.status === 'CONSOLIDATION')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Period Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-gray-900">
            Period {activePeriod?.periodNumber ?? '—'} of {totalPeriods}
            {activePeriod && (
              <span className="ml-1.5 text-xs font-normal text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                {activePeriod.status === 'CONSOLIDATION' ? 'Consolidation' : 'Open'}
              </span>
            )}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          {frozenPeriods} period{frozenPeriods !== 1 ? 's' : ''} frozen
        </p>
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: totalPeriods > 0 ? `${(frozenPeriods / totalPeriods) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {activePeriod
            ? `${formatDate(activePeriod.startDate)} – ${formatDate(activePeriod.endDate)}`
            : '—'}
        </p>
      </CardContent>
    </Card>
  )
}

// ---- Component ----

export default function ProjectOverviewPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading project</div>

  const hasPeriods = data.periods.length > 0
  const timeline = buildTimelineFromPeriods(data.periods)

  // ---- Project Details card (shared across all statuses) ----
  const detailsCard = (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Project Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-gray-100">
          <DetailRow label="Client" value={data.clientName ?? <span className="text-gray-400">—</span>} />
          <DetailRow
            label="Status"
            value={
              <Badge className={projectStatusColors[data.status]}>
                {projectStatusLabels[data.status]}
              </Badge>
            }
          />
          <DetailRow
            label="Start Date"
            value={data.startDate ? formatDate(data.startDate) : <span className="text-gray-400">Not set</span>}
          />
          <DetailRow
            label="End Date"
            value={data.endDate ? formatDate(data.endDate) : <span className="text-gray-400">Not set</span>}
          />
          <DetailRow label="Currency" value={data.currency} />
        </div>
      </CardContent>
    </Card>
  )

  // ---- Project has periods: show period progress + activity timeline ----
  if (hasPeriods) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {detailsCard}
          <PeriodProgressCard periods={data.periods} />
        </div>

        {/* Right column — timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No closed periods yet.</p>
              ) : (
                <ol className="space-y-0">
                  {timeline.map((event, i) => (
                    <li key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                      {timelineIcons[event.type]}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ---- No periods yet (e.g. TO_PLAN / DRAFT): show details + next steps ----
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-1">
        {detailsCard}
      </div>

      {/* Right column — next steps */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Set start and end dates to generate the period grid, then distribute quoted days
              across periods.
            </p>
            <ol className="space-y-3">
              {[
                'Set start and end dates for the project',
                'Review and confirm the period grid',
                'Assign planned days to each period in the Work Table',
                'Start the project when planning is complete',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center size-5 rounded-full border-2 border-gray-300 text-xs font-bold text-gray-400 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
