import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const timesheetsRouter = new Hono()

// Hardcoded current user (auth deferred)
const CURRENT_USER_ID = 'u1'

// GET /api/timesheets/me — current user's timesheets
timesheetsRouter.get('/me', async (c) => {
  const user = await prisma.user.findUnique({ where: { id: CURRENT_USER_ID } })
  if (!user?.employeeId) {
    return c.json([])
  }

  const rows = await prisma.timesheetEntry.findMany({
    where: { employeeId: user.employeeId },
    orderBy: { workDate: 'desc' },
  })

  return c.json(rows)
})

// GET /api/timesheets/approvals — PM's approval queue
timesheetsRouter.get('/approvals', async (c) => {
  const rows = await prisma.timesheetEntry.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { workDate: 'desc' },
  })

  return c.json(rows)
})
