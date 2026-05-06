import { Check, CheckCheck, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { formatDaysWithUnit } from '@/lib/format'
import { HeadCell } from '@/components/shared/head-cell'
import { TdPrimary, TdNumeric, TdDetail, TdRight } from '@/components/shared/table-cells'
import { SuccessButton, ApproveButton, RejectButton } from '@/components/shared/button-adapters'
import { ColorValue } from '@/components/shared/color-value'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardTitleBar, CardFooterBar } from '@/components/shared/card-title-bar'
import { FlexRow } from '@/components/shared/layouts'
import { HintText } from '@/components/shared/hint-text'
import { Separator } from '@/components/shared/separator'
import type { ApprovalRow } from './types'

interface ApprovalsTableProps {
  rows: ApprovalRow[]
  hasAnySubmitted: boolean
  approveAllDisabled: boolean
  onApproveAll: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  getEmployeeName: (id: string) => string
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
}

function formatDelta(delta: number): string {
  if (delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatDaysWithUnit(delta)}`
}

export function ApprovalsTable({
  rows,
  hasAnySubmitted,
  approveAllDisabled,
  onApproveAll,
  onApprove,
  onReject,
  getEmployeeName,
  getTaskName,
  getProfileName,
}: ApprovalsTableProps) {
  const approvedCount = rows.filter((r) => r.status === 'APPROVED').length
  const submittedCount = rows.filter((r) => r.status === 'SUBMITTED').length
  const draftCount = rows.filter((r) => r.status === 'DRAFT').length

  return (
    <Card variant="flush">
      <CardTitleBar
        title="Active period approvals"
        subtitle="Review submitted timesheets and freeze costs"
        actions={
          <>
            {!hasAnySubmitted && <HintText>No submissions yet</HintText>}
            <SuccessButton size="sm" disabled={approveAllDisabled} onClick={onApproveAll}>
              <CheckCheck size={14} />
              Approve All
            </SuccessButton>
          </>
        }
      />

      <Table variant="compact">
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Employee" />
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            <HeadCell label="Planned Days" align="right" width="112px" />
            <HeadCell label="Submitted Days" align="right" width="112px" />
            <HeadCell label="Delta" align="right" width="96px" />
            <HeadCell label="Status" width="112px" />
            <HeadCell label="Actions" width="144px" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const delta = row.submittedDays - row.plannedDays
            return (
              <TableRow key={row.id}>
                <TdPrimary>{getEmployeeName(row.employeeId)}</TdPrimary>
                <TdDetail>{getTaskName(row.taskId)}</TdDetail>
                <TdDetail>{getProfileName(row.profileId)}</TdDetail>
                <TdNumeric>{formatDaysWithUnit(row.plannedDays)}</TdNumeric>
                <TdNumeric>{formatDaysWithUnit(row.submittedDays)}</TdNumeric>
                <TdRight>
                  <ColorValue
                    value={formatDelta(delta)}
                    sentiment={Math.abs(delta) === 0 ? 'neutral' : Math.abs(delta) < 1 ? 'warning' : 'negative'}
                  />
                </TdRight>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  {row.status === 'SUBMITTED' ? (
                    <FlexRow gap="sm">
                      <ApproveButton onClick={() => onApprove(row.id)}>
                        <Check size={14} />
                        Approve
                      </ApproveButton>
                      <RejectButton onClick={() => onReject(row.id)}>
                        <X size={14} />
                        Reject
                      </RejectButton>
                    </FlexRow>
                  ) : (
                    <HintText>
                      {row.status === 'APPROVED'
                        ? 'Approved'
                        : row.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Awaiting submission'}
                    </HintText>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <CardFooterBar>
        <span>
          {approvedCount} of {rows.length} approved
        </span>
        <Separator />
        <span>{submittedCount} pending review</span>
        <Separator />
        <span>{draftCount} not yet submitted</span>
      </CardFooterBar>
    </Card>
  )
}
