import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { timesheetCreateSchema, timesheetUpdateSchema } from './schemas.js'

export const timesheetMutationsRouter = new Hono()

// POST /api/timesheets — create a new timesheet entry (DRAFT)
timesheetMutationsRouter.post('/', async (c) => {
  const raw = await c.req.json()
  const result = timesheetCreateSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const body = result.data

  const id = `ts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const entry = await prisma.timesheetEntry.create({
    data: {
      id,
      employeeId: body.employeeId,
      projectId: body.projectId,
      periodId: body.periodId,
      taskId: body.taskId,
      profileId: body.profileId,
      workDate: body.workDate,
      days: body.days,
      status: 'DRAFT',
      notes: body.notes ?? '',
    },
  })

  return c.json(entry, 201)
})

// PATCH /api/timesheets/:id — update days/notes
timesheetMutationsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const raw = await c.req.json()
  const result = timesheetUpdateSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const body = result.data

  const existing = await prisma.timesheetEntry.findUnique({ where: { id } })
  if (!existing) return c.json({ error: 'Timesheet entry not found' }, 404)
  if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
    return c.json({ error: 'Can only edit DRAFT or REJECTED entries' }, 400)
  }

  const updates: Record<string, unknown> = {}
  if (body.days !== undefined) updates.days = body.days
  if (body.notes !== undefined) updates.notes = body.notes

  const updated = await prisma.timesheetEntry.update({
    where: { id },
    data: updates,
  })

  return c.json(updated)
})

// POST /api/timesheets/:id/submit — DRAFT → SUBMITTED
timesheetMutationsRouter.post('/:id/submit', async (c) => {
  const id = c.req.param('id')

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } })
  if (!entry) return c.json({ error: 'Not found' }, 404)
  if (entry.status !== 'DRAFT' && entry.status !== 'REJECTED') {
    return c.json({ error: `Cannot submit from status ${entry.status}` }, 400)
  }

  const updated = await prisma.timesheetEntry.update({
    where: { id },
    data: { status: 'SUBMITTED' },
  })

  return c.json(updated)
})

// POST /api/timesheets/:id/approve — SUBMITTED → APPROVED (freezes rates)
timesheetMutationsRouter.post('/:id/approve', async (c) => {
  const id = c.req.param('id')

  const updated = await prisma.$transaction(async (tx) => {
    const entry = await tx.timesheetEntry.findUnique({ where: { id } })
    if (!entry) throw Object.assign(new Error('Not found'), { status: 404 })
    if (entry.status !== 'SUBMITTED') {
      throw Object.assign(new Error(`Cannot approve from status ${entry.status}`), { status: 400 })
    }

    // Look up rates in parallel
    const [costRateRecord, sellRateRecord] = await Promise.all([
      tx.employeeCostRate.findFirst({
        where: {
          employeeId: entry.employeeId,
          validFrom: { lte: entry.workDate },
        },
        orderBy: { validFrom: 'desc' },
      }),
      tx.quoteLine.findFirst({
        where: {
          quote: {
            projectId: entry.projectId,
            status: 'VALIDATED',
          },
          taskId: entry.taskId,
          profileId: entry.profileId,
        },
      }),
    ])

    const costRate = costRateRecord?.costRatePerDay ?? 0
    const sellRate = sellRateRecord?.sellRatePerDay ?? 0
    const days = entry.days
    const today = new Date().toISOString().split('T')[0]

    return tx.timesheetEntry.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: today,
        appliedCostRatePerDay: costRate,
        appliedCostAmount: days * costRate,
        appliedSellRatePerDay: sellRate,
        appliedSellAmount: days * sellRate,
      },
    })
  })

  return c.json(updated)
})

// POST /api/timesheets/:id/reject — SUBMITTED → REJECTED
timesheetMutationsRouter.post('/:id/reject', async (c) => {
  const id = c.req.param('id')

  const entry = await prisma.timesheetEntry.findUnique({ where: { id } })
  if (!entry) return c.json({ error: 'Not found' }, 404)
  if (entry.status !== 'SUBMITTED') {
    return c.json({ error: `Cannot reject from status ${entry.status}` }, 400)
  }

  const updated = await prisma.timesheetEntry.update({
    where: { id },
    data: { status: 'REJECTED' },
  })

  return c.json(updated)
})
