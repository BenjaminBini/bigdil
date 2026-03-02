import type { Snapshot } from '@/api/types'
import { AlertBanner } from '@/components/shared/alert-banner'
import { KpiCard } from '@/components/shared/kpi-card'
import { formatCurrency, formatDate } from '@/lib/format'

interface SnapshotSummaryStripProps {
  snapshots: Snapshot[]
}

export function SnapshotSummaryStrip({ snapshots }: SnapshotSummaryStripProps) {
  if (snapshots.length === 0) return null

  return (
    <AlertBanner variant="info" title="Snapshot Summary">
      <div className="mt-2 flex flex-wrap gap-4">
        {snapshots.map((snapshot) => (
          <KpiCard
            key={snapshot.id}
            label={`Period ${snapshot.periodNumber}`}
            value={snapshot.metrics ? formatCurrency(snapshot.metrics.producedExecutionValuePeriod) : '—'}
            description={formatDate(snapshot.snapshotAt)}
            variant="inline"
          />
        ))}
      </div>
    </AlertBanner>
  )
}
