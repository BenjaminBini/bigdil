import { useState, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { Employee, Period, ProfileTaskPeriodStart } from '@/api/types'
import { AssignEmployeePopover } from './assign-employee-popover'
import { TaskRowControls } from './task-row-controls'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { cn } from '@/lib/utils'
import { getRowBackground } from '@/lib/work-table/display'
import { PlanningDetailCard } from './planning-detail-card'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkCell } from './work-cell'
import { useCreateTask } from '@/api/hooks'

function WorkGridDetailRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr className="bg-blue-50/30 dark:bg-blue-950/20">
      <td colSpan={colSpan} className="border-b border-blue-200 p-0 dark:border-blue-900">
        <div className="sticky left-0 overflow-hidden px-4 py-3">{children}</div>
      </td>
    </tr>
  )
}

interface WorkGridMainRowProps {
  row: GridRow
  rowBg: string
  isProfile: boolean
  expandedProfileId: string | null
  setExpandedProfileId: (id: string | null) => void
  children: ReactNode
}

function WorkGridMainRow({ row, rowBg, isProfile, expandedProfileId, setExpandedProfileId, children }: WorkGridMainRowProps) {
  return (
    <tr
      className={cn(
        'group',
        rowBg,
        row.kind === 'grand-total' && 'border-t-2 border-border',
        isProfile && 'cursor-pointer',
        isProfile && expandedProfileId === row.id && 'ring-1 ring-inset ring-blue-300',
      )}
      onClick={
        isProfile
          ? () => setExpandedProfileId(expandedProfileId === row.id ? null : row.id)
          : undefined
      }
    >
      {children}
    </tr>
  )
}

function WorkGridLabelCell({ row, rowBg, children }: { row: GridRow; rowBg: string; children: ReactNode }) {
  return (
    <StickyColumnCell
      className={cn(
        'border-b border-border/70',
        rowBg,
        row.kind === 'phase' && 'text-sm font-bold text-foreground',
        row.kind === 'task' && 'font-semibold text-foreground/80',
        row.kind === 'profile' && 'text-xs text-muted-foreground',
        row.kind === 'employee' && 'text-xs',
        row.kind === 'employee' && row.employeeId === null && 'italic text-muted-foreground/70',
        row.kind === 'employee' && row.employeeId !== null && 'text-foreground/70',
        row.kind === 'grand-total' && 'font-bold text-foreground',
      )}
    >
      <div className="relative flex items-center">
        {children}
      </div>
    </StickyColumnCell>
  )
}

interface WorkGridRowProps {
  projectId: string
  row: GridRow
  periods: Period[]
  collapsedPhases: Set<string>
  collapsedTasks: Set<string>
  togglePhase: (id: string) => void
  toggleTask: (id: string) => void
  expandedProfileId: string | null
  setExpandedProfileId: (id: string | null) => void
  frozenData: Map<string, FrozenData>
  periodStartMap: Map<string, ProfileTaskPeriodStart>
  employees: Employee[]
  onSaveCell?: (params: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) => void
  onAssignEmployee?: (params: { taskId: string; profileId: string; employeeId: string }) => void
}

export function WorkGridRow({
  projectId,
  row,
  periods,
  collapsedPhases,
  collapsedTasks,
  togglePhase,
  toggleTask,
  expandedProfileId,
  setExpandedProfileId,
  frozenData,
  periodStartMap,
  employees,
  onSaveCell,
  onAssignEmployee,
}: WorkGridRowProps) {
  const isProfile = row.kind === 'profile'
  const rowBg = getRowBackground(row)

  const createTask = useCreateTask(projectId)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const newTaskRef = useRef<HTMLInputElement>(null)

  function commitAddTask() {
    const trimmed = newTaskName.trim()
    if (trimmed && row.kind === 'phase') {
      createTask.mutate({ name: trimmed, parentTaskId: row.phaseId }, {
        onSuccess: () => toast.success(`Tâche "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setNewTaskName('')
    setAddingTask(false)
  }

  return (
    <>
      <WorkGridMainRow row={row} rowBg={rowBg} isProfile={isProfile} expandedProfileId={expandedProfileId} setExpandedProfileId={setExpandedProfileId}>
        <WorkGridLabelCell row={row} rowBg={rowBg}>
          <TreeRowLabel
            label={row.label}
            depth={row.depth}
            isExpanded={
              row.kind === 'phase'
                ? !collapsedPhases.has(row.phaseId)
                : row.kind === 'task' && row.taskId
                  ? !collapsedTasks.has(row.taskId)
                  : undefined
            }
            onToggle={
              row.kind === 'phase'
                ? () => togglePhase(row.phaseId)
                : row.kind === 'task' && row.taskId
                  ? () => toggleTask(row.taskId!)
                  : undefined
            }
          />
          {(row.kind === 'phase' || row.kind === 'task') && (
            <TaskRowControls
              projectId={projectId}
              row={row}
              onAddTask={row.kind === 'phase' ? () => setAddingTask(true) : undefined}
            />
          )}
          {row.kind === 'employee' && row.employeeId === null && row.taskId && row.profileId && onAssignEmployee && (
            <AssignEmployeePopover
              employees={employees}
              onAssign={(employeeId) => onAssignEmployee({ taskId: row.taskId!, profileId: row.profileId!, employeeId })}
            />
          )}
        </WorkGridLabelCell>

        {periods.map((period) => (
          <WorkCell
            key={period.id}
            days={row.cells[period.id]}
            periodStatus={period.status}
            rowKind={row.kind}
            onSave={
              row.taskId && row.profileId
                ? (days) => onSaveCell?.({ taskId: row.taskId!, profileId: row.profileId!, employeeId: row.employeeId ?? undefined, periodId: period.id, days })
                : undefined
            }
          />
        ))}
      </WorkGridMainRow>

      {row.kind === 'phase' && addingTask && (
        <tr className="bg-card">
          <StickyColumnCell as="td" className="border-b border-border/70">
            <div className="flex items-center" style={{ paddingLeft: '1.25rem' }}>
              <input
                ref={newTaskRef}
                autoFocus
                placeholder="Nom de la tâche…"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onBlur={commitAddTask}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') newTaskRef.current?.blur()
                  if (e.key === 'Escape') { setNewTaskName(''); setAddingTask(false) }
                }}
                className="w-40 rounded border border-sky-400 bg-background px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </StickyColumnCell>
          {periods.map((period) => (
            <td key={period.id} className="border-b border-r border-border/70" />
          ))}
        </tr>
      )}

      {isProfile && expandedProfileId === row.id && (
        <WorkGridDetailRow colSpan={1 + periods.length}>
          <PlanningDetailCard
            row={row}
            frozenData={frozenData.get(row.id) ?? null}
            periodStart={
              row.taskId && row.profileId
                ? periodStartMap.get(`${row.taskId}:${row.profileId}`) ?? null
                : null
            }
          />
        </WorkGridDetailRow>
      )}
    </>
  )
}
