import { Fragment } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Employee, PeriodInfo, ProfileTaskPeriodStart } from '@/api/types'
import { GridTable } from '@/components/shared/grid-table'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { stickySummaryStyle, SUMMARY_COL_COUNT } from '@/lib/work-table/display'
import { AssignEmployeePopover } from './assign-employee-popover'
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

interface AssignerRowProps {
  taskId: string
  profileId: string
  periodCount: number
  employees: Employee[]
  excludeIds: string[]
  onAssign: (employeeId: string) => void
}

// Synthetic row rendered after each profile group's last visible row.
// Carries the "Assigner +" affordance that previously lived as a small
// "+" icon inside the profile label cell.
function AssignerRow({ periodCount, employees, excludeIds, onAssign }: AssignerRowProps) {
  const { t } = useTranslation('pages')
  return (
    <tr className="h-5 bg-card leading-none">
      <StickyColumnCell noShadow className="!py-0 bg-card">
        <AssignEmployeePopover
          employees={employees}
          excludeIds={excludeIds}
          onAssign={onAssign}
          trigger={
            <button
              type="button"
              className="flex items-center gap-1 pl-[54px] text-[11px] leading-none text-muted-foreground transition-colors hover:text-primary"
            >
              <Plus size={10} strokeWidth={2.5} />
              <span>{t('workTable.assign')}</span>
            </button>
          }
        />
      </StickyColumnCell>
      {Array.from({ length: SUMMARY_COL_COUNT }).map((_, i) => (
        <td key={i} className="!py-0 bg-card" style={stickySummaryStyle(i)} />
      ))}
      <td colSpan={periodCount} className="!py-0 bg-card" />
    </tr>
  )
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
        {visibleRows.map((row, i) => {
          const next = visibleRows[i + 1]
          // End of a profile group: current row belongs to a (task, profile)
          // pair and the next row either does not exist or jumps to a
          // different (task, profile) — that's where the Assigner row goes.
          const inProfileGroup =
            (row.kind === 'profile' || row.kind === 'employee') &&
            !!row.taskId && !!row.profileId
          const nextStaysInGroup =
            !!next &&
            (next.kind === 'profile' || next.kind === 'employee') &&
            next.taskId === row.taskId &&
            next.profileId === row.profileId
          const showAssignerAfter = inProfileGroup && !nextStaysInGroup && !!onAssignEmployee

          return (
            <Fragment key={row.id}>
              <WorkGridRow
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
                onSaveCell={onSaveCell}
              />
              {showAssignerAfter && (
                <AssignerRow
                  taskId={row.taskId!}
                  profileId={row.profileId!}
                  periodCount={periods.length}
                  employees={employees}
                  excludeIds={Array.from(assignedEmployeesByProfile.get(`${row.taskId}:${row.profileId}`) ?? [])}
                  onAssign={(employeeId) =>
                    onAssignEmployee?.({ taskId: row.taskId!, profileId: row.profileId!, employeeId })
                  }
                />
              )}
            </Fragment>
          )
        })}
      </tbody>
    </GridTable>
  )
}
