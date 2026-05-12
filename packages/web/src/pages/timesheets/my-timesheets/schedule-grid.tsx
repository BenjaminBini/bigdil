import { Fragment, useState } from 'react'
import { MessageSquare, Plus, RotateCcw, Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { AssignableSlot } from '@/api/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TdPrimary, TdNumeric, TdNumericPrimary } from '@/components/shared/table-cells'
import { HeadCell } from '@/components/shared/head-cell'
import { CardTitleBar, CardFooterBar } from '@/components/shared/card-title-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { TimesheetStatus } from '@/api/types'

const HOURS_PER_DAY = 8

// Tasks down rows, days across columns. Click a cell → popover with hours
// stepper + notes textarea. Hours are stored on the wire as fractional days
// (1h = 0.125d) but displayed as integer hours for human input.

export interface ScheduleCell {
  hours: number   // 0..8
  notes: string
}

export interface ScheduleTaskRow {
  slotId: string
  projectId: string
  projectName: string
  taskId: string
  taskName: string
  profileName: string
}

export interface ScheduleDay {
  date: string    // ISO date
  label: string   // e.g. "Mon 27"
}

interface ScheduleGridProps {
  periodLabel: string
  status: TimesheetStatus
  days: ScheduleDay[]
  tasks: ScheduleTaskRow[]
  // Cell lookup: cells[`${slotId}::${date}`] → ScheduleCell
  cells: Map<string, ScheduleCell>
  // Leave row: leaveByDate[date] → days (0 | 0.5 | 1)
  leaveByDate: Map<string, number>
  // Every AssignmentSlot the consultant owns. Used by the "+ Ajouter une
  // tâche" picker to surface tasks not yet on this bundle (typical case
  // when the consultant has no PlannedDay for the week but still worked
  // on the slot).
  availableSlots?: AssignableSlot[]
  onCellSave: (params: {
    slotId: string
    date: string
    hours: number
    notes: string
  }) => Promise<void> | void
  onLeaveSave: (params: { date: string; days: number }) => Promise<void> | void
  onAddTask?: (slotId: string) => Promise<void> | void
  onSaveDraft: () => void
  onSubmit: () => void
  isSaving?: boolean
  isSubmitting?: boolean
}

function daysToHours(days: number): number {
  return Math.round(days * HOURS_PER_DAY * 10) / 10
}

function hoursToDays(hours: number): number {
  return Math.round((hours / HOURS_PER_DAY) * 1000) / 1000
}

// Format an hours total as a compound "Nd Mh" — used for row totals where the
// value can exceed a single workday. Day totals (per column) cap at 8h so they
// stay in plain hours.
function formatDaysHours(hours: number): string {
  const rounded = Math.round(hours)
  if (rounded === 0) return '—'
  const d = Math.floor(rounded / HOURS_PER_DAY)
  const h = rounded - d * HOURS_PER_DAY
  if (d === 0) return `${h}h`
  if (h === 0) return `${d}d`
  return `${d}d ${h}h`
}

function clampHours(input: number): number {
  if (Number.isNaN(input)) return 0
  if (input < 0) return 0
  if (input > HOURS_PER_DAY) return HOURS_PER_DAY
  // Granularity = 1h.
  return Math.round(input)
}

// Segmented bar: 8 one-hour cells. Click cell N (1..8) → N hours.
// Click an already-filled trailing cell to clear it (handy un-fill).
interface HoursBarProps {
  value: number
  onChange: (next: number) => void
}

function HoursBar({ value, onChange }: HoursBarProps) {
  const filled = Math.round(value)

  function handleClick(stepIndex: number) {
    const target = stepIndex === filled ? stepIndex - 1 : stepIndex
    onChange(Math.max(0, Math.min(HOURS_PER_DAY, target)))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-stretch gap-1">
        {Array.from({ length: HOURS_PER_DAY }, (_, i) => {
          const stepIndex = i + 1
          const isFilled = stepIndex <= filled
          return (
            <button
              key={stepIndex}
              type="button"
              onClick={() => handleClick(stepIndex)}
              className={cn(
                'h-8 flex-1 rounded transition-colors text-[10px] font-semibold tabular-nums',
                isFilled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20',
              )}
              aria-label={`${stepIndex}h`}
              title={`${stepIndex}h`}
            >
              {stepIndex}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Leave cell — three-state click toggle: 0 → 0.5d → 1d → 0.
// Using a popover would be overkill; the constraint is small enough to cycle.
function LeaveCellTrigger({
  value,
  dayLabel,
  disabled,
  onSelect,
}: {
  value: number
  dayLabel: string
  disabled: boolean
  onSelect: (next: number) => void
}) {
  function next() {
    if (value === 0) return 0.5
    if (value === 0.5) return 1
    return 0
  }

  const label = value === 1 ? '1d' : value === 0.5 ? '½d' : '—'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(next())}
      className={cn(
        'flex h-8 w-full items-center justify-end px-2 text-sm tabular-nums transition-colors',
        !disabled && 'hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring rounded',
        disabled && 'cursor-default',
        value > 0 ? 'text-foreground font-medium' : 'text-muted-foreground/60',
      )}
      title={
        disabled
          ? 'Read-only'
          : `Congés · ${dayLabel} (click: 0 → ½ → 1 → 0)`
      }
    >
      {label}
    </button>
  )
}

interface CellPopoverProps {
  taskName: string
  dayLabel: string
  initialHours: number
  initialNotes: string
  onSubmit: (hours: number, notes: string) => void
  trigger: React.ReactNode
}

function CellPopover({ taskName, dayLabel, initialHours, initialNotes, onSubmit, trigger }: CellPopoverProps) {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(initialHours)
  const [notes, setNotes] = useState(initialNotes)

  function handleOpenChange(next: boolean) {
    if (next) {
      // Re-sync local state from props each time we open.
      setHours(initialHours)
      setNotes(initialNotes)
    } else if (hours !== initialHours || notes !== initialNotes) {
      onSubmit(hours, notes)
    }
    setOpen(next)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 p-3" align="start">
        <div className="flex items-end justify-between gap-2">
          <div className="text-xs">
            <div className="font-semibold text-foreground">{taskName}</div>
            <div className="text-muted-foreground">{dayLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold leading-none tabular-nums text-foreground">
              {hours}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">h</span>
            </div>
            <button
              type="button"
              onClick={() => setHours(0)}
              className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
              title="Clear"
            >
              <RotateCcw size={9} />
              clear
            </button>
          </div>
        </div>
        <HoursBar value={hours} onChange={(next) => setHours(clampHours(next))} />
        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground" htmlFor="cell-notes">
            What was done
          </label>
          <Textarea
            id="cell-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief note about this task on this day…"
            className="text-sm"
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              onSubmit(hours, notes)
              setOpen(false)
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ScheduleGrid({
  periodLabel,
  status,
  days,
  tasks,
  cells,
  leaveByDate,
  availableSlots,
  onCellSave,
  onLeaveSave,
  onAddTask,
  onSaveDraft,
  onSubmit,
  isSaving = false,
  isSubmitting = false,
}: ScheduleGridProps) {
  // Backend allows edits + submit only on DRAFT or REJECTED. Mirror that
  // here so SUBMITTED/APPROVED bundles are read-only and the submit button
  // can't be re-fired.
  const isEditable = status === 'DRAFT' || status === 'REJECTED'

  // Group rows by project so the table reads "Project A → tasks, Project B → tasks".
  const grouped = new Map<string, { name: string; rows: ScheduleTaskRow[] }>()
  for (const task of tasks) {
    const entry = grouped.get(task.projectId)
    if (entry) {
      entry.rows.push(task)
    } else {
      grouped.set(task.projectId, { name: task.projectName, rows: [task] })
    }
  }
  const projectGroups = [...grouped.entries()].map(([projectId, value]) => ({
    projectId,
    projectName: value.name,
    rows: value.rows,
  }))
  function cellOf(slotId: string, date: string): ScheduleCell {
    return cells.get(`${slotId}::${date}`) ?? { hours: 0, notes: '' }
  }

  function leaveOf(date: string): number {
    return leaveByDate.get(date) ?? 0
  }

  const dayTaskHours = days.map((day) =>
    tasks.reduce((sum, task) => sum + cellOf(task.slotId, day.date).hours, 0),
  )
  const dayLeaveHours = days.map((day) => leaveOf(day.date) * HOURS_PER_DAY)
  const dayTotals = days.map((_, i) => dayTaskHours[i] + dayLeaveHours[i])
  const taskTotals = tasks.map((task) =>
    days.reduce((sum, day) => sum + cellOf(task.slotId, day.date).hours, 0),
  )
  const leaveTotalHours = dayLeaveHours.reduce((sum, h) => sum + h, 0)
  const grandTotalHours = dayTotals.reduce((sum, h) => sum + h, 0)

  // Submit fullness: every day in the slice must total exactly 8h.
  const isFullWeek = days.length > 0 && dayTotals.every((h) => Math.abs(h - HOURS_PER_DAY) < 1e-6)

  // Per-task index over the flat tasks list so we can pull pre-computed totals
  // for the row inside the grouped iteration below.
  const taskIndexBySlot = new Map(tasks.map((t, i) => [t.slotId, i]))
  const totalColSpan = 2 + days.length + 1

  // "+ Ajouter une tâche" picker — slots the consultant owns but that have
  // no TaskTimesheet yet in this bundle.
  const usedSlotIds = new Set(tasks.map((t) => t.slotId))
  const addableSlots = (availableSlots ?? []).filter((s) => !usedSlotIds.has(s.id))
  const addableByProject = new Map<string, { name: string; slots: AssignableSlot[] }>()
  for (const slot of addableSlots) {
    const entry = addableByProject.get(slot.projectId)
    if (entry) entry.slots.push(slot)
    else addableByProject.set(slot.projectId, { name: slot.projectName, slots: [slot] })
  }
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <Card variant="flush">
      <CardTitleBar
        title={periodLabel}
        subtitle="Active period"
        actions={<StatusBadge status={status} />}
      />

      <Table variant="compact">
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            {days.map((day) => (
              <HeadCell key={day.date} label={day.label} align="right" width="80px" />
            ))}
            <HeadCell label="Total" align="right" width="72px" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {projectGroups.map((group) => (
            <Fragment key={`group-${group.projectId}`}>
              <TableRow className="bg-muted/40">
                <TableCell
                  colSpan={totalColSpan}
                  className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {group.projectName}
                </TableCell>
              </TableRow>
              {group.rows.map((task) => {
                const taskIdx = taskIndexBySlot.get(task.slotId) ?? 0
                return (
            <TableRow key={task.slotId}>
              <TdPrimary>{task.taskName}</TdPrimary>
              <TableCell className="text-xs text-muted-foreground">{task.profileName}</TableCell>
              {days.map((day) => {
                const cell = cellOf(task.slotId, day.date)
                const trigger = (
                  <button
                    type="button"
                    disabled={!isEditable}
                    className={cn(
                      'group flex h-8 w-full items-center justify-end gap-1 rounded px-2 text-sm tabular-nums transition-colors',
                      isEditable && 'hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring',
                      !isEditable && 'cursor-default',
                      cell.hours > 0 ? 'text-foreground' : 'text-muted-foreground/60',
                    )}
                    title={
                      isEditable
                        ? `${task.taskName} · ${day.label}`
                        : 'Read-only — timesheet already submitted'
                    }
                  >
                    {cell.notes && (
                      <MessageSquare size={10} className="text-muted-foreground/70" />
                    )}
                    <span>{cell.hours > 0 ? `${cell.hours}h` : '—'}</span>
                  </button>
                )
                return (
                  <TableCell key={day.date} className="p-0 text-right">
                    {isEditable ? (
                      <CellPopover
                        taskName={task.taskName}
                        dayLabel={day.label}
                        initialHours={cell.hours}
                        initialNotes={cell.notes}
                        onSubmit={(hours, notes) =>
                          onCellSave({ slotId: task.slotId, date: day.date, hours, notes })
                        }
                        trigger={trigger}
                      />
                    ) : (
                      trigger
                    )}
                  </TableCell>
                )
              })}
              <TdNumeric>{formatDaysHours(taskTotals[taskIdx])}</TdNumeric>
            </TableRow>
                )
              })}
            </Fragment>
          ))}

          {isEditable && onAddTask && addableSlots.length > 0 && (
            <TableRow>
              <TableCell colSpan={totalColSpan} className="py-1.5">
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground">
                      <Plus size={12} />
                      Ajouter une tâche
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-1" align="start">
                    <div className="flex flex-col">
                      {[...addableByProject.entries()].map(([projectId, group]) => (
                        <div key={projectId} className="py-1">
                          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.name}
                          </div>
                          {group.slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setPickerOpen(false)
                                void onAddTask(slot.id)
                              }}
                              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                            >
                              <span className="text-foreground">{slot.taskName}</span>
                              <span className="text-[11px] text-muted-foreground">{slot.profileName}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          )}

          <Fragment key="leave-section">
            <TableRow className="bg-muted/40">
              <TableCell
                colSpan={totalColSpan}
                className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Hors mission
              </TableCell>
            </TableRow>
            <TableRow>
              <TdPrimary>Congés</TdPrimary>
              <TableCell className="text-xs text-muted-foreground">—</TableCell>
              {days.map((day) => {
                const value = leaveOf(day.date)
                return (
                  <TableCell key={day.date} className="p-0 text-right">
                    <LeaveCellTrigger
                      value={value}
                      dayLabel={day.label}
                      disabled={!isEditable}
                      onSelect={(next) => onLeaveSave({ date: day.date, days: next })}
                    />
                  </TableCell>
                )
              })}
              <TdNumeric>{formatDaysHours(leaveTotalHours)}</TdNumeric>
            </TableRow>
          </Fragment>

          <TableRow variant="total">
            <TdPrimary colSpan={2}>Total / day</TdPrimary>
            {dayTotals.map((total, i) => {
              const off = Math.abs(total - HOURS_PER_DAY) > 1e-6
              return (
                <TdNumericPrimary key={days[i].date}>
                  <span className={cn(off && 'text-amber-600 dark:text-amber-400')}>
                    {Math.round(total)}h
                  </span>
                </TdNumericPrimary>
              )
            })}
            <TdNumericPrimary>{formatDaysHours(grandTotalHours)}</TdNumericPrimary>
          </TableRow>
        </TableBody>
      </Table>

      <CardFooterBar align="end">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={!isEditable || isSaving || isSubmitting}
        >
          <Save size={14} />
          Save draft
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!isEditable || !isFullWeek || isSaving || isSubmitting}
          title={
            status === 'SUBMITTED'
              ? 'Already submitted — waiting for approval'
              : status === 'APPROVED'
                ? 'Already approved'
                : !isFullWeek
                  ? 'Every weekday must total 8h (incl. Congés)'
                  : undefined
          }
        >
          <Send size={14} />
          {status === 'SUBMITTED' ? 'Submitted' : status === 'APPROVED' ? 'Approved' : 'Submit'}
        </Button>
      </CardFooterBar>
    </Card>
  )
}

export { daysToHours, hoursToDays, clampHours, HOURS_PER_DAY }
