import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useAllTimesheets,
  useApprovals,
  useApproveTimesheet,
  useReferenceData,
  useRejectTimesheet,
  useTimesheetWindow,
} from '@/api/hooks'
import { comparePeriodSliceKeys } from '@/lib/period-utils'
import type { Timesheet } from '@/api/types'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FullHeightColumn } from '@/components/shared/layouts'
import { formatCurrency } from '@/lib/format'
import { ApprovalsTable } from './approvals/approvals-table'
import { PastApprovals } from './approvals/past-approvals'
import type { ApprovalRow } from './approvals/types'

function buildApprovalRows(approvals: Timesheet[]): ApprovalRow[] {
  return approvals.map((ts) => ({
    id: ts.id,
    employeeId: ts.employeeId,
    periodCode: ts.periodKey,
    entryCount: ts.taskTimesheets.length,
    totalDays:
      ts.taskTimesheets.reduce((sum, e) => sum + e.days, 0) +
      (ts.leaveDays ?? []).reduce((sum, l) => sum + l.days, 0),
    status: ts.status,
    timesheet: ts,
  }))
}

export default function ApprovalsPage() {
  const { t } = useTranslation('pages')
  const { data: approvals, isLoading: isLoadingApprovals } = useApprovals()
  const { data: allTimesheets, isLoading: isLoadingAll } = useAllTimesheets()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: window, isLoading: isLoadingWindow } = useTimesheetWindow()
  const approveTimesheet = useApproveTimesheet()
  const rejectTimesheet = useRejectTimesheet()

  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingApprovals || isLoadingAll || isLoadingRef || isLoadingWindow) {
    return <LoadingState />
  }

  if (!approvals || !allTimesheets || !refData || !window) {
    return <ErrorState message={t('approvals.errorLoading')} />
  }

  const { employees } = refData
  const initialRows = buildApprovalRows(approvals)
  const activeRows = initialRows.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'DRAFT' || r.status === 'REJECTED',
  )

  // "Past approvals" = every timesheet whose period is strictly before the
  // current open week, regardless of status (APPROVED, REJECTED, even
  // stragglers in DRAFT/SUBMITTED that never closed).
  const openPeriodKey = window.openPeriodKey
  const pastTimesheets = allTimesheets
    .filter((ts) => comparePeriodSliceKeys(ts.periodKey, openPeriodKey) < 0)
    .sort((a, b) => {
      const byPeriod = comparePeriodSliceKeys(b.periodKey, a.periodKey)
      if (byPeriod !== 0) return byPeriod
      return (employees.find((e) => e.id === a.employeeId)?.name ?? '')
        .localeCompare(employees.find((e) => e.id === b.employeeId)?.name ?? '')
    })

  const hasAnySubmitted = activeRows.some((r) => r.status === 'SUBMITTED')
  const approveAllDisabled = !activeRows.every((r) => r.status === 'SUBMITTED')

  function getEmployeeName(employeeId: string): string {
    return employees.find((e) => e.id === employeeId)?.name ?? employeeId
  }

  function getCostRate(employeeId: string): number {
    return employees.find((e) => e.id === employeeId)?.currentCostRatePerDay ?? 0
  }

  function handleApprove(id: string) {
    const row = activeRows.find((r) => r.id === id)
    if (!row) return
    const costEstimate = getCostRate(row.employeeId) * row.totalDays
    approveTimesheet.mutate(id, {
      onSuccess: () => toast.success(t('approvals.approved', { cost: formatCurrency(costEstimate) })),
      onError: () => toast.error(t('approvals.approveFailed')),
    })
  }

  function handleReject(id: string) {
    rejectTimesheet.mutate({ timesheetId: id }, {
      onSuccess: () => toast.error(t('approvals.rejected')),
      onError: () => toast.error(t('approvals.rejectFailed')),
    })
  }

  function handleApproveAll() {
    const submitted = activeRows.filter((r) => r.status === 'SUBMITTED')
    submitted.forEach((r) => {
      const costEstimate = getCostRate(r.employeeId) * r.totalDays
      approveTimesheet.mutate(r.id, {
        onSuccess: () =>
          toast.success(t('approvals.approvedEmployee', { name: getEmployeeName(r.employeeId), cost: formatCurrency(costEstimate) })),
        onError: () => toast.error(t('approvals.approveEmployeeFailed', { name: getEmployeeName(r.employeeId) })),
      })
    })
  }

  return (
    <FullHeightColumn>
      <PageHeader title={t('approvals.title')} subtitle={t('approvals.subtitle')} />

      <PageContainer size="lg">
        <ApprovalsTable
          rows={activeRows}
          hasAnySubmitted={hasAnySubmitted}
          approveAllDisabled={approveAllDisabled}
          onApproveAll={handleApproveAll}
          onApprove={handleApprove}
          onReject={handleReject}
          getEmployeeName={getEmployeeName}
        />

        <PastApprovals
          open={pastOpen}
          onOpenChange={setPastOpen}
          timesheets={pastTimesheets}
          getEmployeeName={getEmployeeName}
        />
      </PageContainer>
    </FullHeightColumn>
  )
}
