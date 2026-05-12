import type { Employee, PeriodInfo, ProfileTaskPeriodStart } from '@/api/types'
import { GridTable } from '@/components/shared/grid-table'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkGridHeader } from './work-grid-header'
import { WorkGridRow } from './work-grid-row'

interface WorkGridTableProps {
  projectId: string
  periods: PeriodInfo[]
  visibleRows: GridRow[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
  expandedProfileId: string | null
  setExpandedProfileId: (id: string | null) => void
  frozenData: Map<string, FrozenData>
  periodStartMap: Map<string, ProfileTaskPeriodStart>
  employees: Employee[]
  assignedEmployeesByProfile: Map<string, Set<string>>
  onSaveCell?: (params: { taskId: string; profileId: string; employeeId?: string; periodCode: string; days: number }) => void
  onAssignEmployee?: (params: { taskId: string; profileId: string; employeeId: string }) => void
}

export function WorkGridTable({
  projectId,
  periods,
  visibleRows,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
  expandedProfileId,
  setExpandedProfileId,
  frozenData,
  periodStartMap,
  employees,
  assignedEmployeesByProfile,
  onSaveCell,
  onAssignEmployee,
}: WorkGridTableProps) {
  return (
    <GridTable>
      <WorkGridHeader periods={periods} />
      <tbody>
        {visibleRows.map((row) => (
          <WorkGridRow
            key={row.id}
            projectId={projectId}
            row={row}
            periods={periods}
            collapsedPhases={collapsedPhases}
            collapsedTasks={collapsedTasks}
            togglePhase={togglePhase}
            toggleTask={toggleTask}
            expandedProfileId={expandedProfileId}
            setExpandedProfileId={setExpandedProfileId}
            frozenData={frozenData}
            periodStartMap={periodStartMap}
            employees={employees}
            assignedEmployeesByProfile={assignedEmployeesByProfile}
            onSaveCell={onSaveCell}
            onAssignEmployee={onAssignEmployee}
          />
        ))}
      </tbody>
    </GridTable>
  )
}
