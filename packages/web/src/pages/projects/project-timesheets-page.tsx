import { Fragment, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { TdPrimary, TdNumeric, TdDetail } from '@/components/shared/table-cells'
import { useProject, useProjectTimesheets, useReferenceData } from '@/api/hooks'
import { formatDaysWithUnit } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  comparePeriodSliceKeys,
  formatPeriodSliceLabel,
  getPeriodDates,
  parsePeriodSliceKey,
} from '@/lib/period-utils'
import type { Timesheet, TimesheetStatus } from '@/api/types'
import { StatusBadge } from '@/components/shared/status-badge'

const HOURS_PER_DAY = 8
const DOW_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// Build the Mon-Fri date list inside a slice. Same clamping rule as the
// consultant's ScheduleGrid + the read-only TimesheetDetail.
function buildWeekDays(periodKey: string): { date: string; label: string }[] {
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const sliceCode = weekCode ?? monthCode
  const { startDate: weekStart, endDate: weekEnd } = getPeriodDates(sliceCode)
  const { startDate: monthStart, endDate: monthEnd } = getPeriodDates(monthCode)
  const start = weekCode && monthStart > weekStart ? monthStart : weekStart
  const end = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd
  const out: { date: string; label: string }[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  while (cursor <= stop) {
    const dow = cursor.getUTCDay()
    if (dow >= 1 && dow <= 5) {
      const iso = cursor.toISOString().slice(0, 10)
      out.push({
        date: iso,
        label: `${DOW_FR[dow]} ${String(cursor.getUTCDate()).padStart(2, '0')}`,
      })
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

interface PeriodGroup {
  periodKey: string
  totalDays: number
  employeeIds: Set<string>
  timesheets: Timesheet[]
  statusCounts: Record<TimesheetStatus, number>
}

function groupByPeriod(timesheets: Timesheet[]): PeriodGroup[] {
  const map = new Map<string, PeriodGroup>()
  for (const ts of timesheets) {
    const existing = map.get(ts.periodKey)
    const group = existing ?? {
      periodKey: ts.periodKey,
      totalDays: 0,
      employeeIds: new Set<string>(),
      timesheets: [],
      statusCounts: { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0 } as Record<TimesheetStatus, number>,
    }
    group.timesheets.push(ts)
    group.employeeIds.add(ts.employeeId)
    group.totalDays += ts.taskTimesheets.reduce((sum, e) => sum + e.days, 0)
    group.statusCounts[ts.status] = (group.statusCounts[ts.status] ?? 0) + 1
    map.set(ts.periodKey, group)
  }
  return [...map.values()].sort((a, b) => comparePeriodSliceKeys(b.periodKey, a.periodKey))
}

const STATUS_DISPLAY_ORDER: TimesheetStatus[] = ['APPROVED', 'SUBMITTED', 'REJECTED', 'DRAFT']

function StatusCountBadges({ counts }: { counts: Record<TimesheetStatus, number> }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 justify-end">
      {STATUS_DISPLAY_ORDER.filter((s) => counts[s] > 0).map((status) => (
        <StatusBadge key={status} status={status} label={`${counts[status]} ${STATUS_SHORT[status]}`} />
      ))}
    </span>
  )
}

const STATUS_SHORT: Record<TimesheetStatus, string> = {
  DRAFT: 'brouillon',
  SUBMITTED: 'soumise',
  APPROVED: 'approuvée',
  REJECTED: 'rejetée',
}

// Matrix shown in expanded row — rows are (task, profile, employee) tuples
// gathered from every timesheet in the group, columns are weekdays.
interface PeriodMatrixProps {
  group: PeriodGroup
  employeeNameById: Map<string, string>
}

function PeriodMatrix({ group, employeeNameById }: PeriodMatrixProps) {
  const days = buildWeekDays(group.periodKey)

  type RowKey = string
  interface RowDef {
    key: RowKey
    taskId: string
    taskName: string
    profileId: string
    employeeId: string
    employeeName: string
    employeeStatus: TimesheetStatus
    cellsByDate: Map<string, number>
  }

  const rows = new Map<RowKey, RowDef>()
  for (const ts of group.timesheets) {
    const empName = employeeNameById.get(ts.employeeId) ?? ts.employeeId
    for (const entry of ts.taskTimesheets) {
      const slot = entry.assignmentSlot
      if (!slot) continue
      const key = `${slot.taskId}::${slot.profileId}::${ts.employeeId}`
      const row =
        rows.get(key) ??
        ({
          key,
          taskId: slot.taskId,
          taskName: slot.task?.name ?? slot.taskId,
          profileId: slot.profileId,
          employeeId: ts.employeeId,
          employeeName: empName,
          employeeStatus: ts.status,
          cellsByDate: new Map<string, number>(),
        } satisfies RowDef)
      const prev = row.cellsByDate.get(entry.workDate) ?? 0
      row.cellsByDate.set(entry.workDate, prev + entry.days * HOURS_PER_DAY)
      rows.set(key, row)
    }
  }

  const sortedRows = [...rows.values()].sort((a, b) => {
    const byTask = a.taskName.localeCompare(b.taskName)
    if (byTask !== 0) return byTask
    return a.employeeName.localeCompare(b.employeeName)
  })

  const dayTotals = days.map((d) =>
    sortedRows.reduce((sum, row) => sum + (row.cellsByDate.get(d.date) ?? 0), 0),
  )
  const grandTotal = dayTotals.reduce((s, h) => s + h, 0)

  if (sortedRows.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-muted-foreground">
        No work logged for this period yet.
      </div>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
          <th className="px-3 py-1.5 text-left font-semibold">Task</th>
          <th className="px-3 py-1.5 text-left font-semibold">Employee</th>
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
        {sortedRows.map((row) => {
          const rowTotal = days.reduce(
            (sum, d) => sum + (row.cellsByDate.get(d.date) ?? 0),
            0,
          )
          return (
            <tr key={row.key} className="border-t border-border/40">
              <td className="px-3 py-1.5 text-foreground">{row.taskName}</td>
              <td className="px-3 py-1.5 text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  {row.employeeName}
                  <StatusBadge status={row.employeeStatus} />
                </span>
              </td>
              {days.map((d) => {
                const hours = row.cellsByDate.get(d.date) ?? 0
                return (
                  <td key={d.date} className="px-2 py-1.5 text-right tabular-nums">
                    {hours > 0 ? (
                      <span className="font-medium text-foreground">{Math.round(hours)}h</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                )
              })}
              <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-foreground">
                {formatTotal(rowTotal)}
              </td>
            </tr>
          )
        })}
        <tr className="border-t-2 border-border/60 bg-muted/30">
          <td
            colSpan={2}
            className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Total / day
          </td>
          {dayTotals.map((total, i) => (
            <td
              key={days[i].date}
              className="px-2 py-1.5 text-right tabular-nums font-semibold text-foreground"
            >
              {total > 0 ? `${Math.round(total)}h` : '—'}
            </td>
          ))}
          <td className="px-3 py-1.5 text-right font-bold tabular-nums text-foreground">
            {formatTotal(grandTotal)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default function ProjectTimesheetsPage() {
  const { t } = useTranslation('pages')
  const { id: projectId } = useParams()
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: timesheets, isLoading: tsLoading, error: tsError } = useProjectTimesheets(projectId!)
  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of refData?.employees ?? []) map.set(e.id, e.name)
    return map
  }, [refData])

  if (projectLoading || tsLoading || refLoading) return <LoadingState />
  if (projectError || tsError || refError || !project || !timesheets || !refData) {
    return <ErrorState />
  }

  const groups = groupByPeriod(timesheets)
  // chevron + period + statuses + employees + total = 5 cols
  const colSpan = 5

  return (
    <PageContainer>
      <FlexBetween>
        <div>
          <PageTitle as="h2">{t('projectTimesheets.title')}</PageTitle>
          <MutedText spacing="tight">
            {t('projectTimesheets.subtitle', { project: project.name })}
          </MutedText>
        </div>
      </FlexBetween>

      <Card variant="flush" className="w-fit max-w-full">
        <Table variant="compact" fit>
          <TableHeader>
            <TableRow variant="header">
              <HeadCell label="" width="32px" />
              <HeadCell label={t('projectTimesheetsPage.table.period')} />
              <HeadCell label={t('projectTimesheetsPage.table.status')} align="right" width="220px" />
              <HeadCell label={t('projectTimesheetsPage.table.employees')} align="right" width="120px" />
              <HeadCell label={t('projectTimesheetsPage.table.totalDays')} align="right" width="112px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center text-sm text-muted-foreground py-6">
                  {t('projectTimesheetsPage.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => {
                const isOpen = expanded.has(group.periodKey)
                return (
                  <Fragment key={group.periodKey}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => toggle(group.periodKey)}
                    >
                      <TableCell className="w-8 pr-0">
                        <ChevronRight
                          size={14}
                          className={cn(
                            'transition-transform duration-200 ease-out',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </TableCell>
                      <TdPrimary>{formatPeriodSliceLabel(group.periodKey)}</TdPrimary>
                      <TableCell className="text-right">
                        <StatusCountBadges counts={group.statusCounts} />
                      </TableCell>
                      <TdDetail className="text-right tabular-nums">
                        {group.employeeIds.size}
                      </TdDetail>
                      <TdNumeric>{formatDaysWithUnit(group.totalDays)}</TdNumeric>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={colSpan}
                        className={cn(
                          'border-l-2 bg-muted/10 !p-0',
                          isOpen ? 'border-l-primary/60' : 'border-l-transparent',
                        )}
                      >
                        <div
                          className={cn(
                            'grid transition-[grid-template-rows] duration-200 ease-out',
                            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                          )}
                        >
                          <div className="overflow-hidden">
                            <PeriodMatrix group={group} employeeNameById={employeeNameById} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  )
}
