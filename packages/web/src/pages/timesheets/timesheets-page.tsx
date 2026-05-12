import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react'
import {
  useAddTaskTimesheet,
  useCurrentUser,
  useMyAssignableSlots,
  useMyTimesheets,
  useReferenceData,
  useSubmitTimesheet,
  useTimesheetWindow,
  useUpsertLeaveDay,
} from '@/api/hooks'
import type { Timesheet } from '@/api/types'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { FullHeightColumn } from '@/components/shared/layouts'
import { ActiveBanner } from './my-timesheets/active-banner'
import { PastPeriods } from './my-timesheets/past-periods'
import { ScheduleGrid, hoursToDays, daysToHours } from './my-timesheets/schedule-grid'
import type { ScheduleCell, ScheduleDay, ScheduleTaskRow } from './my-timesheets/schedule-grid'
import type { ClosedPeriodRow } from './my-timesheets/types'
import { comparePeriodSliceKeys, formatPeriodSliceLabel, getPeriodDates, parsePeriodSliceKey } from '@/lib/period-utils'

const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function buildScheduleDays(periodKey: string | null): ScheduleDay[] {
  if (!periodKey) return []
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const sliceCode = weekCode ?? monthCode
  const { startDate: weekStart, endDate: weekEnd } = getPeriodDates(sliceCode)
  // Clamp to month for cross-month weekly slices.
  const { startDate: monthStart, endDate: monthEnd } = getPeriodDates(monthCode)
  const start = weekCode && monthStart > weekStart ? monthStart : weekStart
  const end = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd

  const days: ScheduleDay[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  while (cursor <= stop) {
    const dow = cursor.getUTCDay()
    // Mon-Fri only — weekends are not worked.
    if (dow >= 1 && dow <= 5) {
      const iso = cursor.toISOString().slice(0, 10)
      const day = cursor.getUTCDate()
      days.push({ date: iso, label: `${DAY_LABELS_FR[dow]} ${String(day).padStart(2, '0')}` })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

function buildLeaveMap(timesheet: Timesheet | null): Map<string, number> {
  const map = new Map<string, number>()
  if (!timesheet) return map
  for (const leave of timesheet.leaveDays ?? []) {
    map.set(leave.workDate, leave.days)
  }
  return map
}

function buildTaskRows(
  timesheet: Timesheet | null,
  getProfileName: (id: string) => string,
): ScheduleTaskRow[] {
  if (!timesheet) return []
  const seen = new Map<string, ScheduleTaskRow>()
  for (const entry of timesheet.taskTimesheets) {
    const slot = entry.assignmentSlot
    if (!slot || seen.has(entry.assignmentSlotId)) continue
    seen.set(entry.assignmentSlotId, {
      slotId: entry.assignmentSlotId,
      projectId: slot.projectId,
      projectName: slot.project?.name ?? slot.projectId,
      taskId: slot.taskId,
      taskName: slot.task?.name ?? slot.taskId,
      profileName: getProfileName(slot.profileId),
    })
  }
  // Stable ordering: by project name, then task name.
  return [...seen.values()].sort((a, b) => {
    const byProject = a.projectName.localeCompare(b.projectName)
    if (byProject !== 0) return byProject
    return a.taskName.localeCompare(b.taskName)
  })
}

function buildCells(timesheet: Timesheet | null): Map<string, ScheduleCell> {
  const cells = new Map<string, ScheduleCell>()
  if (!timesheet) return cells
  for (const entry of timesheet.taskTimesheets) {
    cells.set(`${entry.assignmentSlotId}::${entry.workDate}`, {
      hours: daysToHours(entry.days),
      notes: entry.notes,
    })
  }
  return cells
}

function buildClosedPeriodRows(pastTimesheets: Timesheet[]): ClosedPeriodRow[] {
  return pastTimesheets
    .map((ts) => {
      const daysSubmitted =
        ts.taskTimesheets.reduce((sum, entry) => sum + entry.days, 0) +
        (ts.leaveDays ?? []).reduce((sum, leave) => sum + leave.days, 0)
      const costAmount = ts.taskTimesheets.reduce(
        (sum, entry) => sum + (entry.appliedCostAmount ?? 0),
        0,
      )
      return {
        periodCode: ts.periodKey,
        label: periodLabelFromKey(ts.periodKey),
        daysSubmitted,
        costAmount,
        status: ts.status,
        timesheet: ts,
      }
    })
    .sort((a, b) => comparePeriodSliceKeys(b.periodCode, a.periodCode))
}

const periodLabelFromKey = formatPeriodSliceLabel

export default function TimesheetsPage() {
  const { t } = useTranslation('pages')
  const { data: session, isLoading: isLoadingSession } = useCurrentUser()
  const { data: timesheets, isLoading: isLoadingTimesheets } = useMyTimesheets()
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: window, isLoading: isLoadingWindow } = useTimesheetWindow()
  const { data: availableSlots } = useMyAssignableSlots()

  const activeTimesheet = useMemo<Timesheet | null>(() => {
    if (!timesheets) return null
    return (
      timesheets.find((ts) => ts.status === 'DRAFT' || ts.status === 'REJECTED' || ts.status === 'SUBMITTED') ?? null
    )
  }, [timesheets])

  const upsertEntry = useAddTaskTimesheet()
  const upsertLeave = useUpsertLeaveDay()
  const submitTimesheet = useSubmitTimesheet()

  const [pastOpen, setPastOpen] = useState(false)

  if (isLoadingSession || isLoadingTimesheets || isLoadingRef || isLoadingWindow) {
    return <LoadingState />
  }

  if (!timesheets || !refData || !session || !window) {
    return <ErrorState message={t('timesheets.errorLoading')} />
  }

  const { profiles } = refData
  const openPeriodKey = window.openPeriodKey
  // "Past" = any timesheet whose periodKey is strictly before the open one.
  // Includes DRAFT/SUBMITTED/REJECTED stragglers, not just APPROVED.
  const pastTimesheets = timesheets.filter((ts) => comparePeriodSliceKeys(ts.periodKey, openPeriodKey) < 0)
  const closedPeriodRows = buildClosedPeriodRows(pastTimesheets)

  const userName = session.user.name
  const userRoleLabel = session.user.role
  const employeeId = session.user.employeeId
  const employeeName = employeeId
    ? refData.employees.find((e) => e.id === employeeId)?.name
    : undefined
  const subtitle = employeeName
    ? `${employeeName} — ${userName} (${userRoleLabel})`
    : `${userName} - ${userRoleLabel}`

  function getProfileName(profileId: string): string {
    return profiles.find((p) => p.id === profileId)?.name ?? profileId
  }

  const days = activeTimesheet ? buildScheduleDays(activeTimesheet.periodKey) : []
  const tasks = buildTaskRows(activeTimesheet, getProfileName)
  const cells = buildCells(activeTimesheet)
  const leaveByDate = buildLeaveMap(activeTimesheet)
  const periodLabel = activeTimesheet ? periodLabelFromKey(activeTimesheet.periodKey) : ''

  async function handleLeaveSave(params: { date: string; days: number }) {
    if (!activeTimesheet) return
    try {
      await upsertLeave.mutateAsync({
        timesheetId: activeTimesheet.id,
        workDate: params.date,
        days: params.days,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('timesheets.errorLoading')
      toast.error(message)
    }
  }

  async function handleCellSave(params: { slotId: string; date: string; hours: number; notes: string }) {
    if (!activeTimesheet) return
    try {
      await upsertEntry.mutateAsync({
        timesheetId: activeTimesheet.id,
        assignmentSlotId: params.slotId,
        workDate: params.date,
        days: hoursToDays(params.hours),
        notes: params.notes,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('timesheets.errorLoading')
      toast.error(message)
    }
  }

  function handleSaveDraft() {
    // Cell edits already persisted on Save in the popover — no batched draft.
    toast.success(t('timesheets.draftSaved'))
  }

  async function handleSubmit() {
    if (!activeTimesheet) return
    try {
      await submitTimesheet.mutateAsync(activeTimesheet.id)
      toast.success(t('timesheets.submitted'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('timesheets.errorLoading')
      toast.error(message)
    }
  }

  // Add an unassigned slot to the active bundle so the consultant can declare
  // time on it. Creates the TaskTimesheet at days=0 on the slice's first day;
  // the popover then becomes editable like any other row.
  async function handleAddTask(slotId: string) {
    if (!activeTimesheet || days.length === 0) return
    try {
      await upsertEntry.mutateAsync({
        timesheetId: activeTimesheet.id,
        assignmentSlotId: slotId,
        workDate: days[0].date,
        days: 0,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('timesheets.errorLoading')
      toast.error(message)
    }
  }

  return (
    <FullHeightColumn>
      <PageHeader title={t('timesheets.title')} subtitle={subtitle} />

      <PageContainer size="lg">
        {timesheets.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={t('timesheetsPage.empty')}
            description={t('timesheetsPage.emptyDescription')}
          />
        ) : (
          <>
            <ActiveBanner periodLabel={periodLabel} />

            {activeTimesheet ? (
              <ScheduleGrid
                periodLabel={periodLabel}
                status={activeTimesheet.status}
                days={days}
                tasks={tasks}
                cells={cells}
                leaveByDate={leaveByDate}
                availableSlots={availableSlots}
                onCellSave={handleCellSave}
                onLeaveSave={handleLeaveSave}
                onAddTask={handleAddTask}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                isSaving={upsertEntry.isPending || upsertLeave.isPending}
                isSubmitting={submitTimesheet.isPending}
              />
            ) : (
              <ErrorState message={t('timesheets.errorLoading')} variant="muted" />
            )}

            <PastPeriods open={pastOpen} onOpenChange={setPastOpen} rows={closedPeriodRows} />
          </>
        )}
      </PageContainer>
    </FullHeightColumn>
  )
}
