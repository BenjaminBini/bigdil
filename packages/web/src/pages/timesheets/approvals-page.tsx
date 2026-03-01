import { useState } from 'react'
import { toast } from 'sonner'
import { useApprovals, useReferenceData } from '@/api/hooks'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency } from '@/lib/format'
import { ApprovalsTable } from './approvals/approvals-table'
import { buildApprovalRows, buildPastPeriodSummaries } from './approvals/model'
import { PastApprovals } from './approvals/past-approvals'
import type { ApprovalRow } from './approvals/types'

export default function ApprovalsPage() {
  const { data: approvals, isLoading: isLoadingApprovals } = useApprovals()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()

  const [rows, setRows] = useState<ApprovalRow[] | null>(null)
  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingApprovals || isLoadingRef) {
    return <div className="p-6">Loading...</div>
  }

  if (!approvals || !refData) {
    return <div className="p-6 text-red-600">Failed to load approval data.</div>
  }

  const { profiles, employees } = refData
  const initialRows = buildApprovalRows(approvals)
  const activeRows = initialRows.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'DRAFT' || r.status === 'REJECTED',
  )
  const approvedRows = initialRows.filter((r) => r.status === 'APPROVED')
  const displayRows = rows ?? activeRows

  const pastPeriodSummaries = buildPastPeriodSummaries(approvedRows, employees)
  const hasAnySubmitted = displayRows.some((r) => r.status === 'SUBMITTED')
  const approveAllDisabled = !displayRows.every((r) => r.status === 'SUBMITTED')

  function getTaskName(taskId: string): string {
    return taskId
  }

  function getProfileName(profileId: string): string {
    return profiles.find((p) => p.id === profileId)?.name ?? profileId
  }

  function getEmployeeName(employeeId: string): string {
    return employees.find((e) => e.id === employeeId)?.name ?? employeeId
  }

  function getCostRate(employeeId: string): number {
    return employees.find((e) => e.id === employeeId)?.currentCostRatePerDay ?? 0
  }

  function handleApprove(id: string) {
    const base = rows ?? activeRows
    const row = base.find((r) => r.id === id)
    if (!row) return
    const costRate = getCostRate(row.employeeId)
    setRows(base.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)))
    toast.success(`Would approve timesheet - freezing cost rate at ${formatCurrency(costRate)}/d`)
  }

  function handleReject(id: string) {
    const base = rows ?? activeRows
    setRows(base.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)))
    toast.error('Timesheet rejected')
  }

  function handleApproveAll() {
    const base = rows ?? activeRows
    base
      .filter((r) => r.status === 'SUBMITTED')
      .forEach((r) => {
        const costRate = getCostRate(r.employeeId)
        toast.success(
          `Would approve timesheet for ${getEmployeeName(r.employeeId)} - freezing cost rate at ${formatCurrency(costRate)}/d`,
        )
      })
    setRows(base.map((r) => (r.status === 'SUBMITTED' ? { ...r, status: 'APPROVED' } : r)))
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Timesheet Approvals" subtitle="PM view - review and approve submitted timesheets" />

      <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
        <ApprovalsTable
          rows={displayRows}
          hasAnySubmitted={hasAnySubmitted}
          approveAllDisabled={approveAllDisabled}
          onApproveAll={handleApproveAll}
          onApprove={handleApprove}
          onReject={handleReject}
          getEmployeeName={getEmployeeName}
          getTaskName={getTaskName}
          getProfileName={getProfileName}
        />

        <PastApprovals open={pastOpen} onOpenChange={setPastOpen} rows={pastPeriodSummaries} />
      </div>
    </div>
  )
}
