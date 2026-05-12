import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import type { Employee, PeriodInfo, ProfileTaskPeriodStart } from '@/api/types'
import { AssignEmployeePopover } from './assign-employee-popover'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { cn } from '@/lib/utils'
import { getRowBackground, getSolidRowBackground, getRowPaddingY, stickySummaryStyle, SUMMARY_COL_COUNT } from '@/lib/work-table/display'
import { PlanningDetailCard } from './planning-detail-card'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkCell } from './work-cell'

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
  // Match the typographic hierarchy used on the label cell — phase numbers
  // are the loudest, employee numbers the quietest.
  const cellClass = cn(
    'whitespace-nowrap border-b border-row-divider px-1 py-1 text-center tabular-nums',
    solidBg,
    row.kind === 'phase' && 'text-[13px] font-bold text-foreground',
    row.kind === 'task' && 'text-[13px] font-semibold text-foreground/90',
    row.kind === 'profile' && 'text-xs font-medium text-foreground/80',
    row.kind === 'employee' && 'text-xs font-normal text-foreground/80',
    row.kind === 'grand-total' && 'text-sm font-bold text-foreground',
    row.kind === 'quote' && 'text-xs italic text-blue-700 dark:text-blue-300',
  )
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
        // Phase rows mark a new section in the tree — emphasise the boundary
        // with a top separator so two adjacent phases never blend visually.
        row.kind === 'phase' && 'border-t-2 border-row-divider',
        row.kind === 'grand-total' && 'border-t-2 border-row-divider',
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

// Width of the depth-indicator stripe on the label cell's inside-left edge.
// Encodes hierarchy at a glance: thicker + brighter colour at the top of
// the tree, fading down to a hairline for individual employee rows.
const KIND_ACCENT: Record<string, string> = {
  phase: 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary',
  task: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary/50',
  profile: 'before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-muted-foreground/40',
  employee: 'before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-muted-foreground/30',
}

function WorkGridLabelCell({ row, children }: { row: GridRow; children: ReactNode }) {
  return (
    <StickyColumnCell
      noShadow
      className={cn(
        getRowPaddingY(row),
        // Borders here are opaque (no /XX alpha) — the sticky first column
        // must not let scrolling content bleed through the row separators.
        row.kind === 'phase' && 'border-b-2 border-row-divider',
        row.kind === 'task' && 'border-b border-row-divider',
        (row.kind === 'profile' || row.kind === 'employee') && 'border-b border-row-divider',
        row.kind === 'grand-total' && 'border-b-2 border-row-divider',
        getSolidRowBackground(row),
        KIND_ACCENT[row.kind] ?? '',
        row.kind === 'phase' && 'text-[13px] font-bold uppercase tracking-wide text-foreground',
        row.kind === 'task' && 'text-sm font-semibold text-foreground/90',
        row.kind === 'quote' && 'text-xs italic text-blue-700 dark:text-blue-300',
        row.kind === 'profile' && 'text-xs font-medium text-foreground/80',
        row.kind === 'employee' && 'text-xs font-normal',
        row.kind === 'employee' && row.employeeId === null && 'italic text-muted-foreground/60',
        row.kind === 'employee' && row.employeeId !== null && 'text-foreground/80',
        row.kind === 'grand-total' && 'border-t-2 border-row-divider text-sm font-bold uppercase tracking-wide text-foreground',
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
          className={cn('border-b border-row-divider', rowBg)}
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
          {/* Only affordance on the work-table itself: a small always-visible
            * "+" next to a profile row to assign another collaborator. */}
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

        {periods.map((period) => {
          // When an aggregate row's children are hidden by collapse, surface
          // its summed period value so the row still carries information.
          const showAggregateValue =
            (row.kind === 'phase' && collapsedPhases.has(row.phaseId)) ||
            (row.kind === 'task' && !!row.taskId && collapsedTasks.has(row.taskId))
          return (
            <WorkCell
              key={period.code}
              days={row.cells[period.code]}
              periodStatus={period.status}
              rowKind={row.kind}
              isActual={row.kind === 'employee' && (row.actualPeriods?.has(period.periodKey) ?? false)}
              showAggregateValue={showAggregateValue}
              projectId={projectId}
              taskId={row.taskId}
              profileId={row.profileId}
              employeeId={row.kind === 'employee' ? row.employeeId : undefined}
              periodKey={period.periodKey}
              onSave={
                row.taskId && row.profileId
                  ? (days) => onSaveCell?.({ taskId: row.taskId!, profileId: row.profileId!, employeeId: row.employeeId ?? undefined, periodCode: period.code, days })
                  : undefined
              }
            />
          )
        })}
      </WorkGridMainRow>

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
