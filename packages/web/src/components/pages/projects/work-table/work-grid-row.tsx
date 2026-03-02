import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Period, ProfileTaskPeriodStart } from '@/api/types'
import { cn } from '@/lib/utils'
import { getRowBackground } from './display'
import { PlanningDetailCard } from './planning-detail-card'
import type { FrozenData, GridRow } from './types'
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
        <td
          className={cn(
            'sticky left-0 z-20 min-w-[260px] w-[260px] whitespace-nowrap border-b border-slate-200 px-3 py-1.5 shadow-[2px_0_0_0_#cbd5e1]',
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
          <div className="flex items-center gap-1.5">
            {row.depth > 0 && <span style={{ display: 'inline-block', width: row.depth * 16 }} />}

            {row.kind === 'phase' && (
              <button
                onClick={() => togglePhase(row.phaseId)}
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
                aria-label={collapsedPhases.has(row.phaseId) ? 'Expand phase' : 'Collapse phase'}
              >
                {collapsedPhases.has(row.phaseId) ? (
                  <ChevronRight className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}

            {row.kind === 'task' && row.taskId && (
              <button
                onClick={() => toggleTask(row.taskId!)}
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
                aria-label={collapsedTasks.has(row.taskId) ? 'Expand task' : 'Collapse task'}
              >
                {collapsedTasks.has(row.taskId) ? (
                  <ChevronRight className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}

            <span className="max-w-[210px] truncate" title={row.label}>
              {row.label}
            </span>
          </div>
        </td>

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
