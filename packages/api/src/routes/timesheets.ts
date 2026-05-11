import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { getEffectiveUser } from '../lib/current-user.js'
import { toIsoDate, toIsoDateOrNull } from '../lib/dates.js'
import { ensureTimesheetForEmployee } from '../lib/timesheet-provisioning.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'

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
