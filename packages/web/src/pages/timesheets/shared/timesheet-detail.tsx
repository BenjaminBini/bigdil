import { Fragment } from 'react'
import { MessageSquare } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HintText } from '@/components/shared/hint-text'
import { cn } from '@/lib/utils'
import { getPeriodDates, parsePeriodSliceKey } from '@/lib/period-utils'
import type { Timesheet } from '@/api/types'

// Read-only Mon-Fri schedule of a Timesheet — used in approvals expansion and
// past-periods expansion. Mirrors the consultant's ScheduleGrid layout.

const HOURS_PER_DAY = 8

function buildDays(periodKey: string): { date: string; label: string }[] {
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const sliceCode = weekCode ?? monthCode
  const { startDate: weekStart, endDate: weekEnd } = getPeriodDates(sliceCode)
  const { startDate: monthStart, endDate: monthEnd } = getPeriodDates(monthCode)
  const start = weekCode && monthStart > weekStart ? monthStart : weekStart
  const end = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd
  const out: { date: string; label: string }[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  const DOW_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  while (cursor <= stop) {
    const dow = cursor.getUTCDay()
    if (dow >= 1 && dow <= 5) {
      const iso = cursor.toISOString().slice(0, 10)
      out.push({ date: iso, label: `${DOW_FR[dow]} ${String(cursor.getUTCDate()).padStart(2, '0')}` })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

function formatTotal(hours: number): string {
  const rounded = Math.round(hours)
  if (rounded === 0) return '—'
  const d = Math.floor(rounded / HOURS_PER_DAY)
  const h = rounded - d * HOURS_PER_DAY
  if (d === 0) return `${h}h`
  if (h === 0) return `${d}d`
  return `${d}d ${h}h`
}

function HourCell({ hours, notes }: { hours: number; notes?: string }) {
  if (hours === 0 && !notes) {
    return <span className="text-muted-foreground/50">—</span>
  }
  const inner = (
    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
      {notes && <MessageSquare size={10} className="text-muted-foreground/70" />}
      <span className={cn(hours > 0 ? 'font-medium text-foreground' : 'text-muted-foreground/60')}>
        {hours > 0 ? `${hours}h` : '—'}
      </span>
    </span>
  )
  if (!notes) return inner
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{inner}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs whitespace-pre-wrap text-xs">{notes}</TooltipContent>
    </Tooltip>
  )
}

export function TimesheetDetail({ timesheet }: { timesheet: Timesheet }) {
  const days = buildDays(timesheet.periodKey)

  type SlotRow = {
    slotId: string
    projectId: string
    projectName: string
    taskName: string
    cellsByDate: Map<string, { hours: number; notes: string }>
  }
  const slotMap = new Map<string, SlotRow>()
  for (const entry of timesheet.taskTimesheets) {
    const slot = entry.assignmentSlot
    if (!slot) continue
    const existing = slotMap.get(entry.assignmentSlotId)
    const row = existing ?? {
      slotId: entry.assignmentSlotId,
      projectId: slot.projectId,
      projectName: slot.project?.name ?? slot.projectId,
      taskName: slot.task?.name ?? slot.taskId,
      cellsByDate: new Map(),
    }
    row.cellsByDate.set(entry.workDate, {
      hours: Math.round(entry.days * HOURS_PER_DAY),
      notes: entry.notes,
    })
    slotMap.set(entry.assignmentSlotId, row)
  }

  const slotRows = [...slotMap.values()].sort((a, b) => {
    const byProject = a.projectName.localeCompare(b.projectName)
    if (byProject !== 0) return byProject
    return a.taskName.localeCompare(b.taskName)
  })

  type Group = { projectId: string; projectName: string; rows: SlotRow[] }
  const groups: Group[] = []
  for (const row of slotRows) {
    const last = groups[groups.length - 1]
    if (last && last.projectId === row.projectId) last.rows.push(row)
    else groups.push({ projectId: row.projectId, projectName: row.projectName, rows: [row] })
  }

  const leaveByDate = new Map<string, number>()
  for (const l of timesheet.leaveDays ?? []) leaveByDate.set(l.workDate, l.days)

  const dayTaskHours = days.map((d) =>
    slotRows.reduce((sum, row) => sum + (row.cellsByDate.get(d.date)?.hours ?? 0), 0),
  )
  const dayLeaveHours = days.map((d) => (leaveByDate.get(d.date) ?? 0) * HOURS_PER_DAY)
  const dayTotals = days.map((_, i) => dayTaskHours[i] + dayLeaveHours[i])
  const grandTotal = dayTotals.reduce((s, h) => s + h, 0)
  const leaveTotalHours = dayLeaveHours.reduce((s, h) => s + h, 0)
  const hasLeave = (timesheet.leaveDays ?? []).length > 0
  const hasAny = slotRows.length > 0 || hasLeave

  if (!hasAny) {
    return <HintText>No entries on this timesheet.</HintText>
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-background">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-1.5 text-left font-semibold">Task</th>
              {days.map((d) => (
                <th
                  key={d.date}
                  className="px-2 py-1.5 text-right font-semibold tabular-nums"
                  style={{ width: 72 }}
                >
                  {d.label}
                </th>
              ))}
              <th className="px-3 py-1.5 text-right font-semibold" style={{ width: 80 }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.projectId}>
                <tr className="bg-muted/25">
                  <td
                    colSpan={days.length + 2}
                    className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {group.projectName}
                  </td>
                </tr>
                {group.rows.map((row) => {
                  const rowTotal = days.reduce(
                    (sum, d) => sum + (row.cellsByDate.get(d.date)?.hours ?? 0),
                    0,
                  )
                  return (
                    <tr key={row.slotId} className="border-t border-border/40">
                      <td className="px-3 py-1.5 text-foreground">{row.taskName}</td>
                      {days.map((d) => {
                        const cell = row.cellsByDate.get(d.date)
                        return (
                          <td key={d.date} className="px-2 py-1.5 text-right">
                            <HourCell hours={cell?.hours ?? 0} notes={cell?.notes} />
                          </td>
                        )
                      })}
                      <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-foreground">
                        {formatTotal(rowTotal)}
                      </td>
                    </tr>
                  )
                })}
              </Fragment>
            ))}

            {hasLeave && (
              <Fragment>
                <tr className="bg-muted/25">
                  <td
                    colSpan={days.length + 2}
                    className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Hors mission
                  </td>
                </tr>
                <tr className="border-t border-border/40">
                  <td className="px-3 py-1.5 text-foreground">Congés</td>
                  {days.map((d) => {
                    const v = leaveByDate.get(d.date) ?? 0
                    return (
                      <td key={d.date} className="px-2 py-1.5 text-right tabular-nums">
                        {v === 0 ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : (
                          <span className="font-medium text-foreground">
                            {v === 1 ? '1d' : v === 0.5 ? '½d' : `${v}d`}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-foreground">
                    {formatTotal(leaveTotalHours)}
                  </td>
                </tr>
              </Fragment>
            )}

            <tr className="border-t-2 border-border/60 bg-muted/30">
              <td className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total / day
              </td>
              {dayTotals.map((total, i) => {
                const off = Math.abs(total - HOURS_PER_DAY) > 1e-6
                return (
                  <td
                    key={days[i].date}
                    className={cn(
                      'px-2 py-1.5 text-right tabular-nums font-semibold',
                      off ? 'text-amber-600 dark:text-amber-400' : 'text-foreground',
                    )}
                  >
                    {Math.round(total)}h
                  </td>
                )
              })}
              <td className="px-3 py-1.5 text-right font-bold tabular-nums text-foreground">
                {formatTotal(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  )
}
