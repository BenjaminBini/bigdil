import { Fragment, useState } from 'react'
import { Check, CheckCheck, ChevronRight, Inbox, X } from 'lucide-react'
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
import { TdPrimary, TdNumeric, TdDetail } from '@/components/shared/table-cells'
import { SuccessButton, ApproveButton, RejectButton } from '@/components/shared/button-adapters'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardTitleBar, CardFooterBar } from '@/components/shared/card-title-bar'
import { FlexRow } from '@/components/shared/layouts'
import { HintText } from '@/components/shared/hint-text'
import { Separator } from '@/components/shared/separator'
import { cn } from '@/lib/utils'
import { formatPeriodSliceLabel } from '@/lib/period-utils'
import { EmptyState } from '@/components/shared/empty-state'
import { TimesheetDetail } from '../shared/timesheet-detail'
import type { ApprovalRow } from './types'

interface ApprovalsTableProps {
  rows: ApprovalRow[]
  hasAnySubmitted: boolean
  approveAllDisabled: boolean
  onApproveAll: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  getEmployeeName: (id: string) => string
}

interface DetailRowsProps {
  timesheet: import('@/api/types').Timesheet
  colSpan: number
}

function DetailRows({ timesheet, colSpan, isOpen }: DetailRowsProps & { isOpen: boolean }) {
  // Grid-rows trick: animate template rows 0fr → 1fr to slide the content open
  // without measuring height. The inner div needs overflow:hidden so children
  // don't poke out during the transition.
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn(
          'border-l-2 bg-muted/10 !p-0',
          isOpen ? 'border-l-primary/60' : 'border-l-transparent',
        )}
      >
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <TimesheetDetail timesheet={timesheet} />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ApprovalsTable({
  rows,
  hasAnySubmitted,
  approveAllDisabled,
  onApproveAll,
  onApprove,
  onReject,
  getEmployeeName,
}: ApprovalsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const approvedCount = rows.filter((r) => r.status === 'APPROVED').length
  const submittedCount = rows.filter((r) => r.status === 'SUBMITTED').length
  const draftCount = rows.filter((r) => r.status === 'DRAFT').length

  // 7 columns: chevron + employee + period + entries + total + status + actions
  const colSpan = 6

  if (rows.length === 0) {
    return (
      <Card variant="flush">
        <CardTitleBar
          title="Active period approvals"
          subtitle="Review submitted timesheets and freeze costs"
        />
        <EmptyState
          icon={Inbox}
          title="No timesheets to review"
          description="Submitted timesheets land here for approval. Once consultants submit their weekly bundles you'll be able to approve or reject them in one click."
        />
      </Card>
    )
  }

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
            <HeadCell label="" width="32px" />
            <HeadCell label="Employee" />
            <HeadCell label="Period" />
            <HeadCell label="Total Days" align="right" width="112px" />
            <HeadCell label="Status" width="112px" />
            <HeadCell label="Actions" width="144px" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const isOpen = expanded.has(row.id)
            return (
              <Fragment key={row.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => toggle(row.id)}
                >
                  <TableCell className="w-8 pr-0">
                    <ChevronRight
                      size={14}
                      className={cn(
                        'transition-transform duration-200 ease-out',
                        isOpen && 'rotate-90',
                      )}
                    />
                  </TableCell>
                  <TdPrimary>{getEmployeeName(row.employeeId)}</TdPrimary>
                  <TdDetail>{formatPeriodSliceLabel(row.periodCode)}</TdDetail>
                  <TdNumeric>{formatDaysWithUnit(row.totalDays)}</TdNumeric>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                <DetailRows timesheet={row.timesheet} colSpan={colSpan} isOpen={isOpen} />
              </Fragment>
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
