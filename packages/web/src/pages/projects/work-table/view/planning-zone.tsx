import { MetricLine, ZoneTitle } from '@/components/shared/metric-display'
import { ProgressBar } from '@/components/shared/progress-bar'
import { VStack } from '@/components/shared/VStack'

interface PlanningZoneProps {
  soldDays: number
  spentDays: number
  remainingDays: number
  spentPct: number
  formatDays: (days: number) => string
}

export function PlanningZone({ soldDays, spentDays, remainingDays, spentPct, formatDays }: PlanningZoneProps) {
  return (
    <div className="flex-1 min-w-[180px]">
      <ZoneTitle>Planning</ZoneTitle>
      <VStack gap="xs">
        <MetricLine label="Sold" value={formatDays(soldDays)} />
        <MetricLine label="Spent" value={formatDays(spentDays)} />
        <MetricLine label="Remaining" value={formatDays(remainingDays)} />
      </VStack>
      <ProgressBar percent={spentPct} color="bg-blue-500" size="sm" className="mt-2" />
    </div>
  )
}
