import { useState } from 'react'
import { toast } from 'sonner'
import { useMyTimesheets, useProjects, useReferenceData } from '@/api/hooks'
import type { TimesheetEntry, TimesheetStatus } from '@/api/types'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FullHeightColumn } from '@/components/shared/layouts'
import { ActiveTimesheetTable } from './my-timesheets/active-timesheet-table'
import { ActiveBanner } from './my-timesheets/active-banner'
import { PastPeriods } from './my-timesheets/past-periods'
import type { ClosedPeriodRow, EntryRowState } from './my-timesheets/types'

const CURRENT_EMPLOYEE_ID = 'e1'

function buildEntryRows(activeEntries: TimesheetEntry[]): EntryRowState[] {
  return activeEntries.map((entry) => ({
    id: entry.id,
    taskId: entry.taskId,
    profileId: entry.profileId,
    plannedDays: 0,
    actualDays: entry.days,
    notes: entry.notes,
    status: entry.status,
  }))
}

function buildClosedPeriodRows(frozenEntries: TimesheetEntry[]): ClosedPeriodRow[] {
  const periodIds = [...new Set(frozenEntries.map((entry) => entry.periodId))]
  return periodIds.map((periodId) => {
    const entries = frozenEntries.filter((entry) => entry.periodId === periodId)
    const daysSubmitted = entries.reduce((sum, entry) => sum + entry.days, 0)
    const costAmount = entries.reduce((sum, entry) => sum + (entry.appliedCostAmount ?? 0), 0)

    return {
      periodId,
      label: periodId,
      daysSubmitted,
      costAmount,
      status: 'APPROVED',
    }
  })
}

export default function TimesheetsPage() {
  const { data: timesheets, isLoading: isLoadingTimesheets } = useMyTimesheets()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: projects, isLoading: isLoadingProjects } = useProjects()

  const [rows, setRows] = useState<EntryRowState[] | null>(null)
  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingTimesheets || isLoadingRef || isLoadingProjects) {
    return <LoadingState />
  }

  if (!timesheets || !refData || !projects) {
    return <ErrorState message="Impossible de charger les feuilles de temps." />
  }

  const { profiles } = refData
  const myTimesheets = timesheets.filter((ts) => ts.employeeId === CURRENT_EMPLOYEE_ID)
  const activeEntries = myTimesheets.filter((ts) => ts.status === 'DRAFT' || ts.status === 'SUBMITTED')
  const frozenEntries = myTimesheets.filter((ts) => ts.status === 'APPROVED')

  const initialRows = buildEntryRows(activeEntries)
  const displayRows = rows ?? initialRows

  const activeProjectId = activeEntries[0]?.projectId ?? null
  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeProjectName = activeProject?.name ?? 'Projet'

  const closedPeriodRows = buildClosedPeriodRows(frozenEntries)
  const totalPlanned = displayRows.reduce((sum, row) => sum + row.plannedDays, 0)
  const totalActual = displayRows.reduce((sum, row) => sum + row.actualDays, 0)

  function getTaskName(taskId: string): string {
    return taskId
  }

  function getProfileName(profileId: string): string {
    return profiles.find((p) => p.id === profileId)?.name ?? profileId
  }

  function updateRow(id: string, field: 'actualDays' | 'notes', value: string | number) {
    const base = rows ?? initialRows
    const updated = base.map((row) =>
      row.id === id
        ? {
            ...row,
            [field]: field === 'actualDays' ? Number(value) : value,
            status: 'DRAFT' as TimesheetStatus,
          }
        : row,
    )
    setRows(updated)
  }

  function handleSaveDraft() {
    toast.success('Brouillon enregistré')
  }

  function handleSubmit() {
    const base = rows ?? initialRows
    setRows(base.map((row) => ({ ...row, status: 'SUBMITTED' })))
    toast.success('Feuille de temps soumise')
  }

  return (
    <FullHeightColumn>
      <PageHeader title="Mes feuilles de temps" subtitle="Jean Martin - Senior Consultant" />

      <PageContainer size="lg">
        <ActiveBanner projectName={activeProjectName} />

        <ActiveTimesheetTable
          projectName={activeProjectName}
          rows={displayRows}
          totalPlanned={totalPlanned}
          totalActual={totalActual}
          onUpdateRow={updateRow}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          getTaskName={getTaskName}
          getProfileName={getProfileName}
        />

        <PastPeriods open={pastOpen} onOpenChange={setPastOpen} rows={closedPeriodRows} />
      </PageContainer>
    </FullHeightColumn>
  )
}
