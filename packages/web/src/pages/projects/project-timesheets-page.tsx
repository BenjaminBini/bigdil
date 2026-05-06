import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { Legend } from '@/components/shared/legend'
import { PageContainer, LoadingState, ErrorState } from '@/components/shared/page-container'
import { FullHeightColumn } from '@/components/shared/layouts'
import { useProject, useProjectTimesheets, useReferenceData, useWorkTable } from '@/api/hooks'
import { formatShortDate } from '@/lib/format'
import { FiltersBar } from './project-timesheets/filters-bar'
import { TimesheetTable } from './project-timesheets/timesheet-table'
import { ALL_VALUE, buildRows, exportCsv } from './project-timesheets/model'

export default function ProjectTimesheetsPage() {
  const { id: projectId } = useParams()
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: timesheets, isLoading: tsLoading, error: tsError } = useProjectTimesheets(projectId!)
  const { data: workTableData, isLoading: wtLoading, error: wtError } = useWorkTable(projectId!)
  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()

  const [periodFilter, setPeriodFilter] = useState(ALL_VALUE)
  const [employeeFilter, setEmployeeFilter] = useState(ALL_VALUE)
  const [taskFilter, setTaskFilter] = useState(ALL_VALUE)
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE)

  const isLoading = projectLoading || tsLoading || wtLoading || refLoading
  const hasError = projectError || tsError || wtError || refError
  const isReady = !isLoading && !hasError && project && timesheets && workTableData && refData

  const { allRows, periodOptions, employeeOptions, taskOptions, getTaskName, getProfileName } = useMemo(() => {
    if (!isReady) {
      return {
        allRows: [],
        periodOptions: [],
        employeeOptions: [],
        taskOptions: [],
        getTaskName: (id: string) => id,
        getProfileName: (id: string) => id,
      }
    }

    const getTaskName = (taskId: string) => project.flatTasks.find(t => t.id === taskId)?.name ?? taskId
    const getProfileName = (profileId: string) => refData.profiles.find(p => p.id === profileId)?.name ?? profileId
    const getEmployeeName = (employeeId: string) => refData.employees.find(e => e.id === employeeId)?.name ?? employeeId
    const allRows = buildRows(timesheets, workTableData.periods, workTableData.cells, getEmployeeName)

    const periodOptions = [
      { value: ALL_VALUE, label: 'All periods' },
      ...workTableData.periods
        .filter((p) => timesheets.some((ts) => ts.periodId === p.id))
        .map((p) => ({
          value: p.id,
          label: `W${p.periodNumber} (${formatShortDate(p.startDate)} – ${formatShortDate(p.endDate)})`,
        })),
    ]
    const employeeOptions = [
      { value: ALL_VALUE, label: 'All employees' },
      ...refData.employees
        .filter((e) => timesheets.some((ts) => ts.employeeId === e.id))
        .map((e) => ({ value: e.id, label: e.name })),
    ]
    const taskOptions = [
      { value: ALL_VALUE, label: 'All tasks' },
      ...[...new Set(timesheets.map((ts) => ts.taskId))].map((taskId) => ({
        value: taskId,
        label: getTaskName(taskId),
      })),
    ]
    return { allRows, periodOptions, employeeOptions, taskOptions, getTaskName, getProfileName }
  }, [isReady, project, timesheets, workTableData, refData])

  if (isLoading) return <LoadingState />
  if (!isReady) return <ErrorState />

  const filtered = allRows.filter((row) => {
    if (periodFilter !== ALL_VALUE && row.periodId !== periodFilter) return false
    if (employeeFilter !== ALL_VALUE && row.employeeId !== employeeFilter) return false
    if (taskFilter !== ALL_VALUE && row.taskId !== taskFilter) return false
    if (statusFilter !== ALL_VALUE && row.status !== statusFilter) return false
    return true
  })

  const totalPlanned = filtered.reduce((s, r) => s + r.plannedDays, 0)
  const totalActual = filtered.reduce((s, r) => s + r.actualDays, 0)
  const totalCost = filtered.reduce((s, r) => s + (r.costAmount ?? 0), 0)

  return (
    <FullHeightColumn>
      <PageHeader
        title="Project Timesheets"
        subtitle={`${project.name} — Timesheet browser`}
        actions={
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered, project.name, getTaskName, getProfileName)}>
            <Download size={14} />
            Export CSV
          </Button>
        }
      />

      <PageContainer>
        <FiltersBar
          periodFilter={periodFilter}
          employeeFilter={employeeFilter}
          taskFilter={taskFilter}
          statusFilter={statusFilter}
          periodOptions={periodOptions}
          employeeOptions={employeeOptions}
          taskOptions={taskOptions}
          setPeriodFilter={setPeriodFilter}
          setEmployeeFilter={setEmployeeFilter}
          setTaskFilter={setTaskFilter}
          setStatusFilter={setStatusFilter}
        />

        <TimesheetTable
          rows={filtered}
          totalPlanned={totalPlanned}
          totalActual={totalActual}
          totalCost={totalCost}
          getTaskName={getTaskName}
          getProfileName={getProfileName}
        />

        <Legend items={[
          { swatch: 'bg-white', swatchBorder: 'border-gray-200', label: 'Frozen period — frozen cost rates' },
          { swatch: 'bg-amber-50', swatchBorder: 'border-amber-200', label: 'Open period — cost rates pending approval' },
        ]} />
      </PageContainer>
    </FullHeightColumn>
  )
}
