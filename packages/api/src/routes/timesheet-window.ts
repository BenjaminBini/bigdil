import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { requireManagerUser } from '../lib/current-user.js'
import { deriveTimesheetWindowStatus, nextPeriodSliceKey, parsePeriodSliceKey } from '../lib/period-utils.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'
import { ensureTimesheetsForAllActiveEmployees } from '../lib/timesheet-provisioning.js'

export const timesheetWindowRouter = new Hono()

// GET /api/timesheet-window — current global weekly window
timesheetWindowRouter.get('/', async (c) => {
  const window = await requireGlobalTimesheetWindow()
  return c.json(window)
})

// POST /api/timesheet-window/advance — move the global open slice forward
timesheetWindowRouter.post('/advance', async (c) => {
  const user = await requireManagerUser()
  const window = await requireGlobalTimesheetWindow()
  const nextPeriodKey = nextPeriodSliceKey(window.openPeriodKey)
  if (!nextPeriodKey) {
    return c.json({ error: 'No later period available' }, 400)
  }

  const current = parsePeriodSliceKey(window.openPeriodKey)
  const next = parsePeriodSliceKey(nextPeriodKey)
  const sameMonth = current.monthCode === next.monthCode

  const currentRows = await prisma.timesheet.findMany({
    where: { periodKey: window.openPeriodKey },
    select: { status: true },
  })
  const hasOpenDrafts = currentRows.some((row) => row.status === 'DRAFT' || row.status === 'REJECTED')
  if (hasOpenDrafts) {
    return c.json({ error: 'Current open period still has unsubmitted timesheets' }, 400)
  }

  if (!sameMonth) {
    // periodKey is "monthCode" for monthly slices or "monthCode__weekCode" for
    // weekly ones; both match the prefix `${monthCode}` (with the join token
    // for weekly slices) so we can filter purely on the string.
    const monthRows = await prisma.timesheet.findMany({
      where: {
        OR: [
          { periodKey: current.monthCode },
          { periodKey: { startsWith: `${current.monthCode}__` } },
        ],
        status: { not: 'APPROVED' },
      },
      select: { id: true },
    })
    if (monthRows.length > 0) {
      return c.json({ error: 'Current month still has unvalidated timesheets' }, 400)
    }
  }

  const updated = await prisma.globalTimesheetWindow.update({
    where: { id: window.id },
    data: { openPeriodKey: nextPeriodKey },
  })

  // Spawn fresh Timesheet bundles for every active employee in the new
  // open slice — pre-populated from PlannedDay entries for that period.
  const provisioning = await ensureTimesheetsForAllActiveEmployees(nextPeriodKey)

  return c.json({
    window: updated,
    from: window.openPeriodKey,
    to: nextPeriodKey,
    fromStatus: deriveTimesheetWindowStatus(window.openPeriodKey, updated.openPeriodKey),
    toStatus: deriveTimesheetWindowStatus(nextPeriodKey, updated.openPeriodKey),
    sameMonth,
    actedBy: user.id,
    timesheetsCreated: provisioning.totalCreated,
    taskTimesheetsCreated: provisioning.totalEntriesCreated,
  })
})
