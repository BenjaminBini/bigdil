import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { formatDate } from '@/lib/format'
import type { Period } from '@/api/types'

interface PeriodProgressCardProps {
  periods: Period[]
}

export function PeriodProgressCard({ periods }: PeriodProgressCardProps) {
  const totalPeriods = periods.length
  const frozenPeriods = periods.filter((period) => period.status === 'FROZEN').length
  const activePeriod = periods.find((period) => period.status === 'OPEN' || period.status === 'CONSOLIDATION')

  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Period Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-gray-900">
            Period {activePeriod?.periodNumber ?? '—'} of {totalPeriods}
            {activePeriod && (
              <StatusBadge status={activePeriod.status} />
            )}
          </p>
        </div>

        <p className="text-sm text-gray-500">{frozenPeriods} period{frozenPeriods !== 1 ? 's' : ''} frozen</p>

        <ProgressBar percent={totalPeriods > 0 ? (frozenPeriods / totalPeriods) * 100 : 0} />

        <p className="text-xs text-gray-400">
          {activePeriod ? `${formatDate(activePeriod.startDate)} - ${formatDate(activePeriod.endDate)}` : '—'}
        </p>
      </CardContent>
    </Card>
  )
}
