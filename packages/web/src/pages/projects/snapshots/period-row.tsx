import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AlertTriangle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { periodStatusColors, periodStatusLabels } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PeriodStatus } from '@/api/types'

interface PeriodRowProps {
  periodNumber: number
  startDate: string
  endDate: string
  status: PeriodStatus
  snapshotDate: string | null
  contractValue: number | null
  marginForecast: number | null
  producedValue: number | null
  alerts: string[]
  snapshotId: string | null
  projectId: string
  canOpen: boolean
  onFreezePeriod: () => void
}

export function PeriodRow({
  periodNumber,
  startDate,
  endDate,
  status,
  snapshotDate,
  contractValue,
  marginForecast,
  producedValue,
  alerts,
  snapshotId,
  projectId,
  canOpen,
  onFreezePeriod,
}: PeriodRowProps) {
  const navigate = useNavigate()
  const dash = <span className="text-gray-300">—</span>

  function handleOpen() {
    toast.info(`Period ${periodNumber} opened`)
  }

  function handleStartConsolidation() {
    toast.info(`Period ${periodNumber} moved to Consolidation`)
  }

  return (
    <TableRow
      className={cn(
        'hover:bg-gray-50',
        (status === 'OPEN' || status === 'CONSOLIDATION') && 'bg-green-50/30',
        status === 'FUTURE' && 'opacity-70',
      )}
    >
      <TableCell className="font-medium text-gray-900 py-3.5 tabular-nums">P{periodNumber}</TableCell>
      <TableCell className="text-gray-600 text-sm tabular-nums whitespace-nowrap">
        {formatDate(startDate)} – {formatDate(endDate)}
      </TableCell>
      <TableCell>
        <Badge className={periodStatusColors[status]}>
          {periodStatusLabels[status]}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600 text-sm tabular-nums whitespace-nowrap">
        {snapshotDate ? formatDate(snapshotDate) : dash}
      </TableCell>
      <TableCell className="text-right tabular-nums text-gray-700">
        {contractValue != null ? formatCurrency(contractValue) : dash}
      </TableCell>
      <TableCell className="text-right tabular-nums text-gray-700">
        {marginForecast != null ? formatCurrency(marginForecast) : dash}
      </TableCell>
      <TableCell className="text-right tabular-nums text-gray-700">
        {producedValue != null ? formatCurrency(producedValue) : dash}
      </TableCell>
      <TableCell className="max-w-[200px]">
        {alerts.length > 0 ? (
          <div className="flex flex-col gap-1">
            {alerts.map((alert) => (
              <div key={alert} className="flex items-start gap-1 text-amber-700 text-xs">
                <AlertTriangle className="size-3 shrink-0 mt-0.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        ) : (
          dash
        )}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {status === 'FROZEN' && snapshotId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/snapshots/${snapshotId}`)}
          >
            <Eye className="size-3.5" />
            View Snapshot
          </Button>
        )}
        {status === 'CONSOLIDATION' && (
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onFreezePeriod}>
            Freeze Period
          </Button>
        )}
        {status === 'OPEN' && (
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleStartConsolidation}>
            Start Consolidation
          </Button>
        )}
        {status === 'FUTURE' && canOpen && (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpen}>
            Open Period
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
