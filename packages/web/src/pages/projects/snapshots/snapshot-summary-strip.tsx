import type { Snapshot } from '@/api/types'
import { AlertBanner } from '@/components/shared/alert-banner'
import { KpiCard } from '@/components/shared/kpi-card'
import { FlexRow } from '@/components/shared/layouts'
import { formatCurrency, formatDate } from '@/lib/format'

interface SnapshotSummaryStripProps {
  snapshots: Snapshot[]
}

export function SnapshotSummaryStrip({ snapshots }: SnapshotSummaryStripProps) {
  if (snapshots.length === 0) return null

  return (
    <AlertBanner variant="info" title="Snapshot Summary">
      <FlexRow wrap gap="lg" className="mt-2">
        {snapshots.map((snapshot) => (
          <KpiCard
            key={snapshot.id}
            label={`Period ${snapshot.periodNumber}`}
            value={snapshot.metrics ? formatCurrency(snapshot.metrics.producedExecutionValuePeriod) : '—'}
            description={formatDate(snapshot.snapshotAt)}
            variant="inline"
          />
        ))}
      </FlexRow>
    </AlertBanner>
  )
}
