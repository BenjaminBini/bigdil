import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const profilesRouter = new Hono()

// POST /api/profiles — create a new profile
profilesRouter.post('/', async (c) => {
  const body = await c.req.json<{ name: string; defaultSellRatePerDay: number; defaultCostRatePerDay: number }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)
  if (typeof body.defaultSellRatePerDay !== 'number') return c.json({ error: 'defaultSellRatePerDay is required' }, 400)
  if (typeof body.defaultCostRatePerDay !== 'number') return c.json({ error: 'defaultCostRatePerDay is required' }, 400)

  const profile = await prisma.profile.create({
    data: {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      defaultSellRatePerDay: body.defaultSellRatePerDay,
      defaultCostRatePerDay: body.defaultCostRatePerDay,
    },
  })

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

  return c.json(profile)
})

// GET /api/profiles/:id — profile detail + usage across projects
profilesRouter.get('/:id', async (c) => {
  const profileId = c.req.param('id')

  const profile = await prisma.profile.findUnique({ where: { id: profileId } })

  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  // Quote lines using this profile
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

  // Active assignments (planned days with employees)
  const plannedDayRows = await prisma.plannedDay.findMany({
    where: { profileId, employeeId: { not: null } },
    include: { employee: true, project: true },
  })

  const activeAssignments = plannedDayRows.map(pd => ({
    employeeId: pd.employee!.id,
    employeeName: pd.employee!.name,
    projectName: pd.project.name,
    days: pd.days,
  }))

  // Applied rates from approved timesheets
  const timesheetEntryRows = await prisma.timesheetEntry.findMany({
    where: { profileId, appliedCostRatePerDay: { not: null } },
    select: { appliedCostRatePerDay: true, appliedSellRatePerDay: true },
  })

  const appliedRates = timesheetEntryRows.map(r => ({
    costRate: r.appliedCostRatePerDay,
    sellRate: r.appliedSellRatePerDay,
  }))

  return c.json({
    ...profile,
    usage,
    activeAssignments,
    appliedRates,
  })
})
