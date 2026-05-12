import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { getEffectiveUser } from '../lib/current-user.js'
import { toIsoDate, toIsoDateOrNull } from '../lib/dates.js'
import { ensureTimesheetForEmployee } from '../lib/timesheet-provisioning.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'
import { deriveTimesheetWindowStatus } from '../lib/period-utils.js'

export const timesheetsRouter = new Hono()

function taskTimesheetShape<T extends {
  workDate: Date
}>(row: T) {
  return {
    ...row,
    workDate: toIsoDate(row.workDate),
  }
}

function leaveDayShape<T extends { workDate: Date }>(row: T) {
  return { ...row, workDate: toIsoDate(row.workDate) }
}

function timesheetShape<T extends {
  submittedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  taskTimesheets?: { workDate: Date }[]
  leaveDays?: { workDate: Date }[]
}>(row: T) {
  const { taskTimesheets, leaveDays, ...rest } = row
  return {
    ...rest,
    submittedAt: toIsoDateOrNull(rest.submittedAt),
    approvedAt: toIsoDateOrNull(rest.approvedAt),
    rejectedAt: toIsoDateOrNull(rest.rejectedAt),
    taskTimesheets: (taskTimesheets ?? []).map(taskTimesheetShape),
    leaveDays: (leaveDays ?? []).map(leaveDayShape),
  }
}

// GET /api/timesheets/cell-detail — per-day TaskTimesheet breakdown for the
// work-table cell at (taskId, profileId, employeeId, periodKey). Drives the
// floating panel that appears when a user clicks a past cell to inspect or
// edit per-day hours.
timesheetsRouter.get('/cell-detail', async (c) => {
  const taskId = c.req.query('taskId')
  const profileId = c.req.query('profileId')
  const employeeId = c.req.query('employeeId')
  const periodKey = c.req.query('periodKey')
  if (!taskId || !profileId || !employeeId || !periodKey) {
    return c.json({ error: 'taskId, profileId, employeeId and periodKey are required' }, 400)
  }

  const slot = await prisma.assignmentSlot.findFirst({
    where: { taskId, profileId, employeeId },
    select: { id: true },
  })
  if (!slot) return c.json({ error: 'AssignmentSlot not found' }, 404)

  const window = await requireGlobalTimesheetWindow()
  const periodStatus = deriveTimesheetWindowStatus(periodKey, window.openPeriodKey)

  const timesheet = await prisma.timesheet.findUnique({
    where: { employeeId_periodKey: { employeeId, periodKey } },
    include: {
      taskTimesheets: {
        where: { assignmentSlotId: slot.id },
        orderBy: { workDate: 'asc' },
      },
    },
  })

  // FROZEN: read-only. CONSOLIDATION: editable iff bundle is DRAFT/REJECTED.
  // OPEN/FUTURE: panel doesn't make sense (no actuals yet) — endpoint still
  // answers in case caller wants raw data; UI hides the trigger.
  const bundleEditable =
    timesheet?.status === 'DRAFT' || timesheet?.status === 'REJECTED'
  const editable =
    (periodStatus === 'CONSOLIDATION' || periodStatus === 'OPEN') && bundleEditable

  return c.json({
    slotId: slot.id,
    timesheetId: timesheet?.id ?? null,
    bundleStatus: timesheet?.status ?? null,
    periodStatus,
    editable,
    entries: (timesheet?.taskTimesheets ?? []).map((tt) => ({
      id: tt.id,
      workDate: toIsoDate(tt.workDate),
      days: tt.days,
      notes: tt.notes,
    })),
  })
})

// GET /api/timesheets/me/assignable-slots — every AssignmentSlot the
// effective user owns. Used by the schedule grid to surface tasks the
// consultant can declare time on, even when no PlannedDay exists for the
// current slice (late-entry case during CONSOLIDATION).
timesheetsRouter.get('/me/assignable-slots', async (c) => {
  const user = await getEffectiveUser(c)
  if (!user?.employeeId) return c.json([])

  const slots = await prisma.assignmentSlot.findMany({
    where: { employeeId: user.employeeId },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, name: true } },
      profile: { select: { id: true, name: true } },
    },
  })

  return c.json(
    slots.map((slot) => ({
      id: slot.id,
      projectId: slot.project.id,
      projectName: slot.project.name,
      taskId: slot.task.id,
      taskName: slot.task.name,
      profileId: slot.profile.id,
      profileName: slot.profile.name,
    })),
  )
})

// GET /api/timesheets/me — current effective user's timesheets (one per period).
// Honours impersonation: when an admin impersonates an employee, that
// employee's bundles are returned — not the admin's own.
timesheetsRouter.get('/me', async (c) => {
  const user = await getEffectiveUser(c)
  if (!user?.employeeId) return c.json([])

  // Auto-provision the open-period timesheet on first read so the consultant
  // never lands on an empty page just because nobody created their bundle yet.
  const window = await requireGlobalTimesheetWindow()
  await ensureTimesheetForEmployee(user.employeeId, window.openPeriodKey)

  const rows = await prisma.timesheet.findMany({
    where: { employeeId: user.employeeId },
    include: {
      taskTimesheets: {
        include: {
          assignmentSlot: {
            include: {
              task: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { workDate: 'asc' },
      },
      leaveDays: { orderBy: { workDate: 'asc' } },
    },
    orderBy: { periodKey: 'desc' },
  })
  return c.json(rows.map(timesheetShape))
})

// GET /api/timesheets/all — every timesheet, regardless of status.
// Used by the approvals page to surface historic context (past approvals
// + rejected/draft that didn't make it through). Admin scope only.
timesheetsRouter.get('/all', async (c) => {
  const rows = await prisma.timesheet.findMany({
    include: {
      employee: true,
      taskTimesheets: {
        include: {
          assignmentSlot: {
            include: {
              task: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { workDate: 'asc' },
      },
      leaveDays: { orderBy: { workDate: 'asc' } },
    },
    orderBy: { periodKey: 'desc' },
  })
  return c.json(rows.map(timesheetShape))
})

// GET /api/timesheets/approvals — PM's approval queue
timesheetsRouter.get('/approvals', async (c) => {
  const rows = await prisma.timesheet.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      employee: true,
      taskTimesheets: {
        include: {
          assignmentSlot: {
            include: {
              task: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { workDate: 'asc' },
      },
      leaveDays: { orderBy: { workDate: 'asc' } },
    },
    orderBy: { submittedAt: 'desc' },
  })
  return c.json(rows.map(timesheetShape))
})
