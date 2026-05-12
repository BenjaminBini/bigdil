import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { PeriodStatus } from '@/api/types'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CompactInput } from '@/components/shared/compact-input'
import type { RowKind } from '@/lib/work-table/types'
import { CellDetailPopover } from './cell-detail-popover'

interface WorkCellProps {
  days: number | undefined
  periodStatus: PeriodStatus
  rowKind: RowKind
  // True when the value comes from a TaskTimesheet (declared work) rather
  // than a PlannedDay. Rendered with an accent so users can distinguish
  // actuals from plan at a glance.
  isActual?: boolean
  // Aggregate rows usually leave period cells blank, but when their children
  // are collapsed we surface the aggregate value so the user still sees a
  // total for the period.
  showAggregateValue?: boolean
  // Identity needed for the past-cell detail popover. Only used when
  // periodStatus is FROZEN or CONSOLIDATION and rowKind is 'employee'.
  projectId?: string
  taskId?: string
  profileId?: string
  employeeId?: string | null
  periodKey?: string
  onSave?: (days: number) => void
}

export function WorkCell({
  days,
  periodStatus,
  rowKind,
  showAggregateValue = false,
  projectId,
  taskId,
  profileId,
  employeeId,
  periodKey,
  onSave,
}: WorkCellProps) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isLeaf = rowKind === 'employee'
  // Period cells only carry values on employee rows. Aggregate rows
  // (phase / task / profile / grand-total) keep the cell coloured but
  // empty — totals live in the summary columns on the left. Exception:
  // when an aggregate row's children are collapsed (showAggregateValue),
  // we surface the period total so the row still reads.
  const isAggregate = rowKind === 'phase' || rowKind === 'task' || rowKind === 'profile' || rowKind === 'grand-total'
  const suppressAggregate = isAggregate && !showAggregateValue
  const isEmpty = suppressAggregate || days === undefined || days === 0
  const isEditable = isLeaf && periodStatus !== 'FROZEN' && periodStatus !== 'CONSOLIDATION'
  // Past cells (frozen / consolidation) on an employee row open a per-day
  // detail popover. Frozen → read-only, Consolidation → editable iff bundle
  // is DRAFT/REJECTED (the API enforces).
  const showDetail =
    isLeaf &&
    (periodStatus === 'FROZEN' || periodStatus === 'CONSOLIDATION') &&
    !!projectId && !!taskId && !!profileId && employeeId != null && !!periodKey

  function handleClick() {
    if (!isEditable) return
    setInputVal(days !== undefined && days !== 0 ? String(days) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setEditing(false)
    const parsed = parseFloat(inputVal.replace(',', '.'))
    if (!isNaN(parsed) && parsed !== (days ?? 0)) {
      onSave?.(parsed)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  // Period cells inherit the row-kind colour from the first column so a row
  // reads as a single band end-to-end. Same tier tokens as the sticky columns
  // (see lib/work-table/display.ts) so the whole row stays one colour across
  // the sticky-vs-scrolling boundary in every theme.
  const cellBg =
    rowKind === 'phase' ? 'bg-row-phase'
      : rowKind === 'task' ? 'bg-row-task'
        : rowKind === 'profile' ? 'bg-row-profile'
          : rowKind === 'employee' ? 'bg-row-employee'
            : rowKind === 'grand-total' ? 'bg-row-total'
              : rowKind === 'quote' ? 'bg-row-quote'
                : 'bg-card'

  // Borders on period cells: every kind except employee shows a faint grid;
  // employee rows render flat so the per-day band reads as one surface.
  const periodCellBorders = rowKind === 'employee' ? '' : 'border-b border-r border-border/50'

  if (editing) {
    return (
      <td className={cn(periodCellBorders, 'p-0 min-w-[56px] w-14', cellBg)}>
        <CompactInput
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </td>
    )
  }

  const cellClasses = cn(
    'min-w-[56px] w-14 px-1.5 py-1 text-right font-mono tabular-nums',
    periodCellBorders,
    cellBg,
    // Row-kind hierarchy — aggregates loud, employee row distinctly recessed.
    rowKind === 'phase' && 'text-[13px] font-bold text-foreground',
    rowKind === 'task' && 'text-[13px] font-semibold text-foreground/90',
    rowKind === 'profile' && 'text-xs font-medium text-foreground/80',
    rowKind === 'employee' && 'text-xs font-normal text-foreground/80',
    rowKind === 'grand-total' && 'text-sm font-bold text-foreground',
    rowKind === 'quote' && 'text-xs italic text-blue-700 dark:text-blue-300',
    isEmpty && 'text-muted-foreground/40',
    isEditable && 'cursor-pointer transition-colors hover:border hover:border-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/30',
    showDetail && !isEmpty && 'cursor-pointer transition-colors hover:border hover:border-amber-300',
  )

  if (showDetail && !isEmpty) {
    const trigger = (
      <td
        className={cellClasses}
        title="Voir détail jour par jour"
      >
        {formatDays(days)}
      </td>
    )
    return (
      <CellDetailPopover
        projectId={projectId!}
        taskId={taskId!}
        profileId={profileId!}
        employeeId={employeeId!}
        periodKey={periodKey!}
        totalDays={days ?? 0}
        trigger={trigger}
      />
    )
  }

  const content = suppressAggregate ? '' : isEmpty ? '—' : formatDays(days)
  return (
    <td
      className={cellClasses}
      onClick={handleClick}
      title={isEditable ? 'Click to edit' : undefined}
    >
      {content}
    </td>
  )
}
