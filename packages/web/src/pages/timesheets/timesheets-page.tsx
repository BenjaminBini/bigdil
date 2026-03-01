import { useState } from 'react'
import { toast } from 'sonner'
import { useMyTimesheets, useProjects, useReferenceData } from '@/api/hooks'
import type { TimesheetStatus } from '@/api/types'
import { PageHeader } from '@/components/shared/page-header'
import { ActiveTimesheetTable } from './my-timesheets/active-timesheet-table'
import { ActiveBanner } from './my-timesheets/active-banner'
import { buildClosedPeriodRows, buildEntryRows, CURRENT_EMPLOYEE_ID } from './my-timesheets/model'
import { PastPeriods } from './my-timesheets/past-periods'
import type { EntryRowState } from './my-timesheets/types'

export default function TimesheetsPage() {
  const { data: timesheets, isLoading: isLoadingTimesheets } = useMyTimesheets()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: projects, isLoading: isLoadingProjects } = useProjects()

  const [rows, setRows] = useState<EntryRowState[] | null>(null)
  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingTimesheets || isLoadingRef || isLoadingProjects) {
    return <div className="p-6">Loading...</div>
  }

  if (!timesheets || !refData || !projects) {
    return <div className="p-6 text-red-600">Failed to load timesheet data.</div>
  }

  const { profiles } = refData
  const myTimesheets = timesheets.filter((ts) => ts.employeeId === CURRENT_EMPLOYEE_ID)
  const activeEntries = myTimesheets.filter((ts) => ts.status === 'DRAFT' || ts.status === 'SUBMITTED')
  const frozenEntries = myTimesheets.filter((ts) => ts.status === 'APPROVED')

  const initialRows = buildEntryRows(activeEntries)
  const displayRows = rows ?? initialRows

  const activeProjectId = activeEntries[0]?.projectId ?? null
  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeProjectName = activeProject?.name ?? 'Project'

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
    toast.success('Draft saved')
  }

  function handleSubmit() {
    const base = rows ?? initialRows
    setRows(base.map((row) => ({ ...row, status: 'SUBMITTED' })))
    toast.success('Timesheet submitted')
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="My Timesheets" subtitle="Jean Martin - Senior Consultant" />

      <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
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
      </div>
    </div>
  )
}
