import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { MutedText } from '@/components/shared/muted-text'
import { TextCaption } from '@/components/shared/text-caption'
import { TextStrong } from '@/components/shared/text-strong'
import { FlexRow } from '@/components/shared/layouts'
import { formatDate } from '@/lib/format'
import type { ReactNode } from 'react'
import type { Period } from '@/api/types'

function PeriodLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm text-foreground">{children}</p>
}

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
        <FlexRow gap="md">
          <Clock size={16} color="#16a34a" className="shrink-0" />
          <PeriodLabel>
            <TextStrong>Period {activePeriod?.periodNumber ?? '—'} of {totalPeriods}</TextStrong>
            {activePeriod && (
              <StatusBadge status={activePeriod.status} />
            )}
          </PeriodLabel>
        </FlexRow>

        <MutedText>{frozenPeriods} period{frozenPeriods !== 1 ? 's' : ''} frozen</MutedText>

        <ProgressBar percent={totalPeriods > 0 ? (frozenPeriods / totalPeriods) * 100 : 0} />

        <TextCaption>
          {activePeriod ? `${formatDate(activePeriod.startDate)} - ${formatDate(activePeriod.endDate)}` : '—'}
        </TextCaption>
      </CardContent>
    </Card>
  )
}
