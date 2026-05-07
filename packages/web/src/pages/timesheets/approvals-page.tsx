import { useState } from 'react'
import { toast } from 'sonner'
import { useApprovals, useReferenceData, useApproveTimesheet, useRejectTimesheet } from '@/api/hooks'
import type { Employee, TimesheetEntry } from '@/api/types'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FullHeightColumn } from '@/components/shared/layouts'
import { formatCurrency } from '@/lib/format'
import { ApprovalsTable } from './approvals/approvals-table'
import { PastApprovals } from './approvals/past-approvals'
import type { ApprovalRow, PastPeriodSummary } from './approvals/types'

function buildApprovalRows(approvals: TimesheetEntry[]): ApprovalRow[] {
  return approvals.map((timesheet) => ({
    id: timesheet.id,
    employeeId: timesheet.employeeId,
    taskId: timesheet.taskId,
    profileId: timesheet.profileId,
    projectId: timesheet.projectId,
    periodId: timesheet.periodId,
    plannedDays: 0,
    submittedDays: timesheet.days,
    status: timesheet.status,
  }))
}

function buildPastPeriodSummaries(
  approvedRows: ApprovalRow[],
  employees: Employee[],
): PastPeriodSummary[] {
  const periodIds = [...new Set(approvedRows.map((row) => row.periodId))]
  return periodIds.map((periodId) => {
    const entries = approvedRows.filter((row) => row.periodId === periodId)
    const totalCost = entries.reduce((sum, entry) => {
      const employee = employees.find((candidate) => candidate.id === entry.employeeId)
      return sum + entry.submittedDays * (employee?.currentCostRatePerDay ?? 0)
    }, 0)

    return {
      periodId,
      totalEntries: entries.length,
      approvedEntries: entries.length,
      totalCost,
    }
  })
}

export default function ApprovalsPage() {
  const { data: approvals, isLoading: isLoadingApprovals } = useApprovals()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const approveTimesheet = useApproveTimesheet()
  const rejectTimesheet = useRejectTimesheet()

  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingApprovals || isLoadingRef) {
    return <LoadingState />
  }

  if (!approvals || !refData) {
    return <ErrorState message="Impossible de charger les données d'approbation." />
  }

  const { profiles, employees } = refData
  const initialRows = buildApprovalRows(approvals)
  const activeRows = initialRows.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'DRAFT' || r.status === 'REJECTED',
  )
  const approvedRows = initialRows.filter((r) => r.status === 'APPROVED')

  const pastPeriodSummaries = buildPastPeriodSummaries(approvedRows, employees)
  const hasAnySubmitted = activeRows.some((r) => r.status === 'SUBMITTED')
  const approveAllDisabled = !activeRows.every((r) => r.status === 'SUBMITTED')

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
    const row = activeRows.find((r) => r.id === id)
    if (!row) return
    const costRate = getCostRate(row.employeeId)
    approveTimesheet.mutate(id, {
      onSuccess: () => toast.success(`Feuille approuvée — taux de coût figé à ${formatCurrency(costRate)}/j`),
      onError: () => toast.error("Échec de l'approbation"),
    })
  }

  function handleReject(id: string) {
    rejectTimesheet.mutate(id, {
      onSuccess: () => toast.error('Feuille de temps rejetée'),
      onError: () => toast.error('Échec du rejet'),
    })
  }

  function handleApproveAll() {
    const submitted = activeRows.filter((r) => r.status === 'SUBMITTED')
    submitted.forEach((r) => {
      const costRate = getCostRate(r.employeeId)
      approveTimesheet.mutate(r.id, {
        onSuccess: () =>
          toast.success(`${getEmployeeName(r.employeeId)} approuvé — ${formatCurrency(costRate)}/j figé`),
        onError: () => toast.error(`Échec : ${getEmployeeName(r.employeeId)}`),
      })
    })
  }

  return (
    <FullHeightColumn>
      <PageHeader title="Approbations" subtitle="Vue chef de projet — vérifier et approuver les feuilles soumises" />

      <PageContainer size="lg">
        <ApprovalsTable
          rows={activeRows}
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
      </PageContainer>
    </FullHeightColumn>
  )
}
