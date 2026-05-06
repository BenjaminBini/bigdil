import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AlertTriangle, Eye } from 'lucide-react'
import { useOpenPeriod, useStartConsolidation } from '@/api/hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { TdPrimary, TdNumeric, TdDetail, TdRight, NullCell } from '@/components/shared/table-cells'
import { WarningButton } from '@/components/shared/button-adapters'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PeriodStatus } from '@/api/types'

function AlertItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-1 text-amber-700 text-xs">
      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}

function AlertsList({ alerts }: { alerts: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      {alerts.map((alert) => (
        <AlertItem key={alert}>{alert}</AlertItem>
      ))}
    </div>
  )
}

function AlertsCell({ alerts, fallback }: { alerts: string[]; fallback: ReactNode }) {
  return (
    <TableCell className="max-w-[200px]">
      {alerts.length > 0 ? <AlertsList alerts={alerts} /> : fallback}
    </TableCell>
  )
}

function PeriodTableRow({ status, children }: { status: PeriodStatus; children: ReactNode }) {
  return (
    <TableRow
      className={cn(
        'hover:bg-gray-50',
        (status === 'OPEN' || status === 'CONSOLIDATION') && 'bg-green-50/30',
        status === 'FUTURE' && 'opacity-70',
      )}
    >
      {children}
    </TableRow>
  )
}

interface PeriodRowProps {
  periodId: string
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
  periodId,
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
  const openPeriod = useOpenPeriod(projectId)
  const startConsolidation = useStartConsolidation(projectId)
  const dash = <NullCell />

  function handleOpen() {
    openPeriod.mutate(periodId, {
      onSuccess: () => toast.success(`Period ${periodNumber} opened`),
      onError: () => toast.error(`Failed to open Period ${periodNumber}`),
    })
  }

  function handleStartConsolidation() {
    startConsolidation.mutate(periodId, {
      onSuccess: () => toast.success(`Period ${periodNumber} moved to Consolidation`),
      onError: () => toast.error(`Failed to start consolidation for Period ${periodNumber}`),
    })
  }

  return (
    <PeriodTableRow status={status}>
      <TdPrimary tabularNums>P{periodNumber}</TdPrimary>
      <TdDetail tabularNums nowrap>
        {formatDate(startDate)} – {formatDate(endDate)}
      </TdDetail>
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>
      <TdDetail tabularNums nowrap>
        {snapshotDate ? formatDate(snapshotDate) : dash}
      </TdDetail>
      <TdNumeric>
        {contractValue != null ? formatCurrency(contractValue) : dash}
      </TdNumeric>
      <TdNumeric>
        {marginForecast != null ? formatCurrency(marginForecast) : dash}
      </TdNumeric>
      <TdNumeric>
        {producedValue != null ? formatCurrency(producedValue) : dash}
      </TdNumeric>
      <AlertsCell alerts={alerts} fallback={dash} />
      <TdRight nowrap>
        {status === 'FROZEN' && snapshotId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/snapshots/${snapshotId}`)}
          >
            <Eye size={14} />
            View Snapshot
          </Button>
        )}
        {status === 'CONSOLIDATION' && (
          <WarningButton size="sm" onClick={onFreezePeriod}>
            Freeze Period
          </WarningButton>
        )}
        {status === 'OPEN' && (
          <WarningButton size="sm" onClick={handleStartConsolidation}>
            Start Consolidation
          </WarningButton>
        )}
        {status === 'FUTURE' && canOpen && (
          <Button size="sm" onClick={handleOpen}>
            Open Period
          </Button>
        )}
      </TdRight>
    </PeriodTableRow>
  )
}
