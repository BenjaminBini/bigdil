import type { Snapshot } from '@/api/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SnapshotSummaryStripProps {
  snapshots: Snapshot[]
}

export function SnapshotSummaryStrip({ snapshots }: SnapshotSummaryStripProps) {
  if (snapshots.length === 0) return null

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
      <p className="mb-3 text-sm font-medium text-blue-800">Snapshot Summary</p>
      <div className="flex flex-wrap gap-4">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex flex-col gap-0.5 rounded-md border border-blue-100 bg-white px-3 py-2 text-xs shadow-xs"
          >
            <span className="font-semibold text-gray-700">Period {snapshot.periodNumber}</span>
            <span className="text-gray-500">{formatDate(snapshot.snapshotAt)}</span>
            <span className="font-medium text-green-700">
              {snapshot.metrics ? formatCurrency(snapshot.metrics.producedExecutionValuePeriod) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
