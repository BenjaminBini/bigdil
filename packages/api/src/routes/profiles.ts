import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { auditLog } from '../lib/audit.js'

export const profilesRouter = new Hono()

// POST /api/profiles — create a new profile
profilesRouter.post('/', async (c) => {
  const body = await c.req.json<{ name: string; defaultSellRatePerDay: number; defaultCostRatePerDay: number }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)
  if (typeof body.defaultSellRatePerDay !== 'number') return c.json({ error: 'defaultSellRatePerDay is required' }, 400)
  if (typeof body.defaultCostRatePerDay !== 'number') return c.json({ error: 'defaultCostRatePerDay is required' }, 400)

  const profile = await prisma.profile.create({
    data: {
      name: body.name.trim(),
      defaultSellRatePerDay: body.defaultSellRatePerDay,
      defaultCostRatePerDay: body.defaultCostRatePerDay,
    },
  })
  await auditLog({ entity: 'Profile', entityId: profile.id, action: 'CREATE', after: profile })

  return c.json(profile, 201)
})

// PATCH /api/profiles/:id — update a profile's name and/or rates
profilesRouter.patch('/:id', async (c) => {
  const profileId = c.req.param('id')
  const body = await c.req.json<{ name?: string; defaultSellRatePerDay?: number; defaultCostRatePerDay?: number }>()

  const existing = await prisma.profile.findUnique({ where: { id: profileId } })
  if (!existing) return c.json({ error: 'Profile not found' }, 404)

  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(typeof body.defaultSellRatePerDay === 'number' ? { defaultSellRatePerDay: body.defaultSellRatePerDay } : {}),
      ...(typeof body.defaultCostRatePerDay === 'number' ? { defaultCostRatePerDay: body.defaultCostRatePerDay } : {}),
    },
  })
  await auditLog({ entity: 'Profile', entityId: profile.id, action: 'UPDATE', before: existing, after: profile })

  return c.json(profile)
})

// DELETE /api/profiles/:id — delete a profile, only if not referenced anywhere
profilesRouter.delete('/:id', async (c) => {
  const profileId = c.req.param('id')

  const existing = await prisma.profile.findUnique({ where: { id: profileId } })
  if (!existing) return c.json({ error: 'Profile not found' }, 404)

  // Profile is "in use" if referenced by any of: AssignmentSlot,
  // ProfileTaskPeriodStart, QuoteLine, SnapshotScopeLine, SnapshotWorkRow.
  const [assignmentSlots, periodStarts, quoteLines, snapshotScopeLines, snapshotWorkRows] = await Promise.all([
    prisma.assignmentSlot.count({ where: { profileId } }),
    prisma.profileTaskPeriodStart.count({ where: { profileId } }),
    prisma.quoteLine.count({ where: { profileId } }),
    prisma.snapshotScopeLine.count({ where: { profileId } }),
    prisma.snapshotWorkRow.count({ where: { profileId } }),
  ])

  const usage = { assignmentSlots, periodStarts, quoteLines, snapshotScopeLines, snapshotWorkRows }
  const totalRefs = assignmentSlots + periodStarts + quoteLines + snapshotScopeLines + snapshotWorkRows

  if (totalRefs > 0) {
    return c.json({ error: 'Profile is in use', usage }, 409)
  }

  await prisma.profile.delete({ where: { id: profileId } })
  await auditLog({ entity: 'Profile', entityId: profileId, action: 'DELETE', before: existing })

  return c.json({ success: true })
})

// GET /api/profiles/:id — profile detail + usage across projects
profilesRouter.get('/:id', async (c) => {
  const profileId = c.req.param('id')

  const profile = await prisma.profile.findUnique({ where: { id: profileId } })
  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  const quoteLineRows = await prisma.quoteLine.findMany({
    where: { profileId },
    include: { quote: { include: { project: true } } },
  })

  const usage = quoteLineRows.map(ql => ({
    quoteId: ql.quote.id,
    quoteTitle: ql.quote.title,
    quoteStatus: ql.quote.status,
    projectId: ql.quote.project.id,
    projectName: ql.quote.project.name,
    days: ql.days,
    sellRatePerDay: ql.sellRatePerDay,
    costRateAssumptionPerDay: ql.costRateAssumptionPerDay,
    revenueAmount: ql.revenueAmount,
  }))

  // Active assignments are now expressed via AssignmentSlot. Pull slots for this
  // profile that have a (non-null) employee, then summarise total planned days.
  const slots = await prisma.assignmentSlot.findMany({
    where: { profileId, employeeId: { not: null } },
    include: { employee: true, project: true, plannedDays: true },
  })

  const activeAssignments = slots.map(slot => ({
    employeeId: slot.employee!.id,
    employeeName: slot.employee!.name,
    projectName: slot.project.name,
    days: slot.plannedDays.reduce((sum, pd) => sum + pd.days, 0),
  }))

  // Applied rates from approved timesheets — slot.profileId is the link.
  const taskTimesheetRows = await prisma.taskTimesheet.findMany({
    where: {
      assignmentSlot: { profileId },
      appliedCostRatePerDay: { not: null },
    },
    select: { appliedCostRatePerDay: true, appliedSellRatePerDay: true },
  })

  const appliedRates = taskTimesheetRows.map(r => ({
    costRate: r.appliedCostRatePerDay,
    sellRate: r.appliedSellRatePerDay,
  }))

  return c.json({ ...profile, usage, activeAssignments, appliedRates })
})
