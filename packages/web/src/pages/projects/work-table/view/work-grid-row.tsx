import type { Period, ProfileTaskPeriodStart } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { cn } from '@/lib/utils'
import { getRowBackground } from '@/lib/work-table/display'
import { PlanningDetailCard } from './planning-detail-card'
import type { FrozenData, GridRow } from '@/lib/work-table/types'
import { WorkCell } from './work-cell'

interface WorkGridRowProps {
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
}

export function WorkGridRow({
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
}: WorkGridRowProps) {
  const isProfile = row.kind === 'profile'
  const rowBg = getRowBackground(row)

  return (
    <>
      <tr
        className={cn(
          'group',
          rowBg,
          row.kind === 'grand-total' && 'border-t-2 border-slate-300',
          isProfile && 'cursor-pointer',
          isProfile && expandedProfileId === row.id && 'ring-1 ring-inset ring-blue-300',
        )}
        onClick={
          isProfile
            ? () => setExpandedProfileId(expandedProfileId === row.id ? null : row.id)
            : undefined
        }
      >
        <StickyColumnCell
          className={cn(
            'border-b border-slate-200',
            rowBg,
            row.kind === 'phase' && 'text-sm font-bold text-slate-800',
            row.kind === 'task' && 'font-semibold text-slate-700',
            row.kind === 'profile' && 'text-xs text-slate-500',
            row.kind === 'employee' && 'text-xs',
            row.kind === 'employee' && row.employeeId === null && 'italic text-slate-400',
            row.kind === 'employee' && row.employeeId !== null && 'text-slate-600',
            row.kind === 'grand-total' && 'font-bold text-slate-900',
          )}
        >
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
        </StickyColumnCell>

        {periods.map((period) => (
          <WorkCell key={period.id} days={row.cells[period.id]} periodStatus={period.status} rowKind={row.kind} />
        ))}
      </tr>

      {isProfile && expandedProfileId === row.id && (
        <tr className="bg-blue-50/40">
          <td colSpan={1 + periods.length} className="border-b border-blue-200 p-0">
            <div className="sticky left-0 overflow-hidden px-4 py-3">
              <PlanningDetailCard
                row={row}
                frozenData={frozenData.get(row.id) ?? null}
                periodStart={
                  row.taskId && row.profileId
                    ? periodStartMap.get(`${row.taskId}:${row.profileId}`) ?? null
                    : null
                }
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
