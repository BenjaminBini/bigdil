import { useState, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import type { Employee, PeriodInfo, ProfileTaskPeriodStart } from '@/api/types'
import { AssignEmployeePopover } from './assign-employee-popover'
import { TaskRowControls } from './task-row-controls'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { cn } from '@/lib/utils'
import { getRowBackground, getSolidRowBackground, stickySummaryStyle, SUMMARY_COL_COUNT } from '@/lib/work-table/display'
import { PlanningDetailCard } from './planning-detail-card'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkCell } from './work-cell'
import { useCreateTask } from '@/api/hooks'

function formatDays(value: number): string {
  if (value === 0) return '—'
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

interface SummaryCellsProps {
  row: GridRow
}

function SummaryCells({ row }: SummaryCellsProps) {
  const isAggregateLevel =
    row.kind === 'phase' || row.kind === 'task' || row.kind === 'profile' || row.kind === 'grand-total'

  const solidBg = getSolidRowBackground(row)
  const cellClass = cn('whitespace-nowrap border-b border-r border-border/70 px-1 py-1 text-center text-xs tabular-nums', solidBg)
  // Quote rows are commercial breakdown — period split / to-plan don't apply.
  if (row.kind === 'quote') {
    return (
      <>
        <td className={cellClass} style={stickySummaryStyle(0)}>—</td>
        <td className={cellClass} style={stickySummaryStyle(1)}>—</td>
        <td className={cellClass} style={stickySummaryStyle(2)}>—</td>
        <td className={cellClass} style={stickySummaryStyle(3)}>—</td>
      </>
    )
  }
  const showQuoteCols = isAggregateLevel
  return (
    <>
      <td className={cellClass} style={stickySummaryStyle(0)}>{formatDays(row.validatedDaysSpent)}</td>
      <td className={cellClass} style={stickySummaryStyle(1)}>{formatDays(row.daysInConsolidation)}</td>
      <td className={cellClass} style={stickySummaryStyle(2)}>{formatDays(row.totalRemaining)}</td>
      <td
        className={cn(
          cellClass,
          showQuoteCols && row.toPlan > 0 && 'font-semibold text-amber-700 dark:text-amber-400',
        )}
        style={stickySummaryStyle(3)}
      >
        {showQuoteCols ? formatDays(row.toPlan) : '—'}
      </td>
    </>
  )
}

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

function WorkGridLabelCell({ row, children }: { row: GridRow; children: ReactNode }) {
  return (
    <StickyColumnCell
      noShadow
      className={cn(
        'border-b border-border/70',
        getSolidRowBackground(row),
        row.kind === 'phase' && 'text-sm font-bold text-foreground',
        row.kind === 'task' && 'font-semibold text-foreground/80',
        row.kind === 'quote' && 'text-xs italic text-blue-700 dark:text-blue-300',
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

function QuoteRowLabel({ row }: { row: GridRow }) {
  return (
    <div className="flex items-center gap-1.5 pl-10">
      <FileText size={11} className="shrink-0 text-blue-500" />
      <span className="truncate font-medium text-blue-700 dark:text-blue-300">{row.label}</span>
      <span className="ml-auto shrink-0 tabular-nums text-blue-700/70 dark:text-blue-300/70">{row.quotedDays}j</span>
    </div>
  )
}

interface WorkGridRowProps {
  projectId: string
  row: GridRow
  periods: PeriodInfo[]
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
  assignedEmployeesByProfile,
  onSaveCell,
  onAssignEmployee,
}: WorkGridRowProps) {
  const { t } = useTranslation('pages')
  const isProfile = row.kind === 'profile'
  const rowBg = getRowBackground(row)

  const createTask = useCreateTask(projectId)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const newTaskRef = useRef<HTMLInputElement>(null)

  function commitAddTask() {
    const trimmed = newTaskName.trim()
    if (trimmed && row.kind === 'phase') {
      createTask.mutate({ phaseId: row.phaseId, name: trimmed }, {
        onSuccess: () => toast.success(t('workTable.taskCreated', { name: trimmed })),
        onError: () => toast.error(t('workTable.createFailed')),
      })
    }
    setNewTaskName('')
    setAddingTask(false)
  }

  const displayLabel =
    row.kind === 'grand-total'
      ? t('workTable.grandTotal')
      : row.kind === 'employee' && row.employeeId === null
        ? t('workTable.unassigned')
        : row.label

  if (row.kind === 'quote') {
    return (
      <tr className={cn('group', rowBg)}>
        <WorkGridLabelCell row={row}>
          <QuoteRowLabel row={row} />
        </WorkGridLabelCell>
        <SummaryCells row={row} />
        <td
          colSpan={periods.length}
          className={cn('border-b border-border/70', rowBg)}
        />
      </tr>
    )
  }

  return (
    <>
      <WorkGridMainRow row={row} rowBg={rowBg} isProfile={isProfile} expandedProfileId={expandedProfileId} setExpandedProfileId={setExpandedProfileId}>
        <WorkGridLabelCell row={row}>
          <TreeRowLabel
            label={displayLabel}
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
            />
          )}
          {row.kind === 'employee' && row.employeeId === null && row.taskId && row.profileId && onAssignEmployee && (
            <AssignEmployeePopover
              employees={employees}
              onAssign={(employeeId) => onAssignEmployee({ taskId: row.taskId!, profileId: row.profileId!, employeeId })}
            />
          )}
          {row.kind === 'profile' && row.taskId && row.profileId && onAssignEmployee && (
            <AssignEmployeePopover
              employees={employees}
              triggerTitle={t('workTable.addEmployeeToProfile', 'Ajouter un collaborateur')}
              excludeIds={Array.from(assignedEmployeesByProfile.get(`${row.taskId}:${row.profileId}`) ?? [])}
              onAssign={(employeeId) => onAssignEmployee({ taskId: row.taskId!, profileId: row.profileId!, employeeId })}
            />
          )}
        </WorkGridLabelCell>

        <SummaryCells row={row} />

        {periods.map((period) => (
          <WorkCell
            key={period.code}
            days={row.cells[period.code]}
            periodStatus={period.status}
            rowKind={row.kind}
            onSave={
              row.taskId && row.profileId
                ? (days) => onSaveCell?.({ taskId: row.taskId!, profileId: row.profileId!, employeeId: row.employeeId ?? undefined, periodCode: period.code, days })
                : undefined
            }
          />
        ))}
      </WorkGridMainRow>

      {row.kind === 'phase' && addingTask && (
        <tr className="bg-card">
          <StickyColumnCell as="td" noShadow className="border-b border-border/70 bg-card">
            <div className="flex items-center" style={{ paddingLeft: '1.25rem' }}>
              <input
                ref={newTaskRef}
                autoFocus
                placeholder={t('workTable.taskNamePlaceholder')}
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
          {Array.from({ length: SUMMARY_COL_COUNT }).map((_, i) => (
            <td key={`sum-${i}`} className="border-b border-r border-border/70 bg-card" style={stickySummaryStyle(i)} />
          ))}
          {periods.map((period) => (
            <td key={period.code} className="border-b border-r border-border/70" />
          ))}
        </tr>
      )}

      {isProfile && expandedProfileId === row.id && (
        <WorkGridDetailRow colSpan={1 + SUMMARY_COL_COUNT + periods.length}>
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
