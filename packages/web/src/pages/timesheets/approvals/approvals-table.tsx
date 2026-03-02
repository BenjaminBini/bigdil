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
import { SuccessButton, ApproveButton, RejectButton } from '@/components/shared/button-adapters'
import { ColorValue } from '@/components/shared/color-value'
import { StatusBadge } from '@/components/shared/status-badge'
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
      <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">Active period approvals</h2>
          <p className="mt-0.5 text-xs text-gray-500">Review submitted timesheets and freeze costs</p>
        </div>
        <div className="flex items-center gap-2">
          {!hasAnySubmitted && <span className="text-xs italic text-gray-400">No submissions yet</span>}
          <SuccessButton size="sm" disabled={approveAllDisabled} onClick={onApproveAll}>
            <CheckCheck className="size-3.5" />
            Approve All
          </SuccessButton>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <HeadCell label="Employee" />
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            <HeadCell label="Planned Days" className="w-28 text-right" />
            <HeadCell label="Submitted Days" className="w-28 text-right" />
            <HeadCell label="Delta" className="w-24 text-right" />
            <HeadCell label="Status" className="w-28" />
            <HeadCell label="Actions" className="w-36" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const delta = row.submittedDays - row.plannedDays
            return (
              <TableRow key={row.id}>
                <TableCell className="py-3 font-medium text-gray-900">{getEmployeeName(row.employeeId)}</TableCell>
                <TableCell className="py-3 text-sm text-gray-700">{getTaskName(row.taskId)}</TableCell>
                <TableCell className="py-3 text-sm text-gray-600">{getProfileName(row.profileId)}</TableCell>
                <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.plannedDays)}</TableCell>
                <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.submittedDays)}</TableCell>
                <TableCell className="py-3 text-right">
                  <ColorValue
                    value={formatDelta(delta)}
                    sentiment={Math.abs(delta) === 0 ? 'neutral' : Math.abs(delta) < 1 ? 'warning' : 'negative'}
                  />
                </TableCell>
                <TableCell className="py-3">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="py-2">
                  {row.status === 'SUBMITTED' ? (
                    <div className="flex items-center gap-1.5">
                      <ApproveButton onClick={() => onApprove(row.id)}>
                        <Check className="size-3.5" />
                        Approve
                      </ApproveButton>
                      <RejectButton onClick={() => onReject(row.id)}>
                        <X className="size-3.5" />
                        Reject
                      </RejectButton>
                    </div>
                  ) : (
                    <span className="text-xs italic text-gray-400">
                      {row.status === 'APPROVED'
                        ? 'Approved'
                        : row.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Awaiting submission'}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center gap-4 border-t bg-gray-50 px-5 py-3 text-xs text-gray-500">
        <span>
          {approvedCount} of {rows.length} approved
        </span>
        <span className="text-gray-300">|</span>
        <span>{submittedCount} pending review</span>
        <span className="text-gray-300">|</span>
        <span>{draftCount} not yet submitted</span>
      </div>
    </Card>
  )
}
