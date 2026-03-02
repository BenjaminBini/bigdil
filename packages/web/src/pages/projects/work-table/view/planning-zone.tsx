import { MetricLine, PLANNING_DETAIL_CLASSES } from '@/components/shared/metric-display'
import { ProgressBar } from '@/components/shared/progress-bar'

interface PlanningZoneProps {
  soldDays: number
  spentDays: number
  remainingDays: number
  spentPct: number
  formatDays: (days: number) => string
}

export function PlanningZone({ soldDays, spentDays, remainingDays, spentPct, formatDays }: PlanningZoneProps) {
  return (
    <div className="min-w-[180px] flex-1">
      <div className={PLANNING_DETAIL_CLASSES.zoneTitle}>Planning</div>
      <div className="space-y-1">
        <MetricLine label="Sold" value={formatDays(soldDays)} />
        <MetricLine label="Spent" value={formatDays(spentDays)} />
        <MetricLine label="Remaining" value={formatDays(remainingDays)} />
      </div>
      <ProgressBar percent={spentPct} color="bg-blue-500" className="mt-2 h-1" />
    </div>
  )
}
