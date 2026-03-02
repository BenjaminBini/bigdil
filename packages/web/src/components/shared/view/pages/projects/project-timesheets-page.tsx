/* eslint-disable max-lines */
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { useProject, useProjectTimesheets, useReferenceData, useWorkTable } from '@/api/hooks'
import type { Period, TimesheetEntry, WorkTableCell } from '@/api/types'
import { formatShortDate } from '@/lib/format'
import { FiltersBar } from './project-timesheets/filters-bar'
import { TimesheetTable, type TimesheetRow } from './project-timesheets/timesheet-table'

const ALL_VALUE = 'all'

function getPlannedDays(
  taskId: string,
  profileId: string,
  employeeId: string | null,
  periodId: string,
  workTable: WorkTableCell[],
): number {
  const cell = workTable.find(
    (candidate) =>
      candidate.taskId === taskId &&
      candidate.profileId === profileId &&
      candidate.employeeId === employeeId &&
      candidate.periodId === periodId,
  )
  return cell?.days ?? 0
}

function buildRows(
  timesheets: TimesheetEntry[],
  periods: Period[],
  workTable: WorkTableCell[],
  getEmployeeName: (id: string) => string,
): TimesheetRow[] {
  return timesheets.map((timesheet) => {
    const period = periods.find((entry) => entry.id === timesheet.periodId)!
    const plannedDays = getPlannedDays(
      timesheet.taskId,
      timesheet.profileId,
      timesheet.employeeId,
      timesheet.periodId,
      workTable,
    )
    return {
      id: timesheet.id,
      periodId: timesheet.periodId,
      periodNumber: period.periodNumber,
      periodLabel: `W${period.periodNumber}`,
      periodStatus: period.status,
      employeeId: timesheet.employeeId,
      employeeName: getEmployeeName(timesheet.employeeId),
      taskId: timesheet.taskId,
      profileId: timesheet.profileId,
      plannedDays,
      actualDays: timesheet.days,
      costRate: timesheet.appliedCostRatePerDay,
      costAmount: timesheet.appliedCostAmount,
      status: timesheet.status,
    }
  })
}

function exportCsv(
  rows: TimesheetRow[],
  projectName: string,
  getTaskName: (id: string) => string,
  getProfileName: (id: string) => string,
) {
  const headers = [
    'Period',
    'Employee',
    'Task',
    'Profile',
    'Planned Days',
    'Actual Days',
    'Delta',
    'Cost Rate (€/d)',
    'Cost Amount (€)',
    'Status',
  ]
  const lines = rows.map((row) => {
    const delta = row.actualDays - row.plannedDays
    return [
      row.periodLabel,
      row.employeeName,
      getTaskName(row.taskId),
      getProfileName(row.profileId),
      row.plannedDays,
      row.actualDays,
      delta,
      row.costRate ?? '',
      row.costAmount ?? '',
      row.status,
    ]
      .map((value) => `"${value}"`)
      .join(',')
  })
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `timesheets-${projectName.replace(/\s+/g, '-').toLowerCase()}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

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

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!isReady) return <div className="p-6">Error loading data</div>

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
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Project Timesheets"
        subtitle={`${project.name} — Timesheet browser`}
        actions={
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered, project.name, getTaskName, getProfileName)}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-5">
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

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-white border border-gray-200" />
            Frozen period — frozen cost rates
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-amber-50 border border-amber-200" />
            Open period — cost rates pending approval
          </span>
        </div>
      </div>
    </div>
  )
}
