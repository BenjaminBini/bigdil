import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const employeesRouter = new Hono()

// POST /api/employees — create a new employee
employeesRouter.post('/', async (c) => {
  const body = await c.req.json<{ name: string; currentCostRatePerDay: number }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)
  if (typeof body.currentCostRatePerDay !== 'number' || body.currentCostRatePerDay < 0) {
    return c.json({ error: 'currentCostRatePerDay must be a non-negative number' }, 400)
  }

  const today = new Date().toISOString().split('T')[0]
  const employeeId = crypto.randomUUID()

  const employee = await prisma.$transaction(async (tx) => {
    const created = await tx.employee.create({
      data: {
        id: employeeId,
        name: body.name.trim(),
        active: true,
        currentCostRatePerDay: body.currentCostRatePerDay,
      },
    })

    await tx.employeeCostRate.create({
      data: {
        id: crypto.randomUUID(),
        employeeId,
        validFrom: today,
        validTo: null,
        costRatePerDay: body.currentCostRatePerDay,
      },
    })

    return created
  })

  return c.json({
    id: employee.id,
    name: employee.name,
    active: employee.active,
    currentCostRatePerDay: employee.currentCostRatePerDay,
    costRateHistory: [{ validFrom: today, validTo: null, costRatePerDay: body.currentCostRatePerDay }],
  }, 201)
})

// POST /api/employees/:id/rates — add a new cost rate period
employeesRouter.post('/:id/rates', async (c) => {
  const employeeId = c.req.param('id')
  const body = await c.req.json<{ validFrom: string; costRatePerDay: number }>()

  if (!body.validFrom) return c.json({ error: 'validFrom is required' }, 400)
  if (typeof body.costRatePerDay !== 'number' || body.costRatePerDay < 0) {
    return c.json({ error: 'costRatePerDay must be a non-negative number' }, 400)
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  await prisma.$transaction(async (tx) => {
    const openRate = await tx.employeeCostRate.findFirst({
      where: { employeeId, validTo: null },
      orderBy: { validFrom: 'desc' },
    })

    if (openRate) {
      const prevDate = new Date(body.validFrom)
      prevDate.setDate(prevDate.getDate() - 1)
      await tx.employeeCostRate.update({
        where: { id: openRate.id },
        data: { validTo: prevDate.toISOString().split('T')[0] },
      })
    }

    await tx.employeeCostRate.create({
      data: {
        id: crypto.randomUUID(),
        employeeId,
        validFrom: body.validFrom,
        validTo: null,
        costRatePerDay: body.costRatePerDay,
      },
    })

    await tx.employee.update({
      where: { id: employeeId },
      data: { currentCostRatePerDay: body.costRatePerDay },
    })
  })

  return c.json({ success: true })
})

// GET /api/employees/:id — employee detail + assignments + utilization
employeesRouter.get('/:id', async (c) => {
  const employeeId = c.req.param('id')

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })

  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  const [costRates, rawAssignments, timesheets] = await Promise.all([
    prisma.employeeCostRate.findMany({
      where: { employeeId },
      orderBy: { validFrom: 'asc' },
    }),

    prisma.plannedDay.findMany({
      where: { employeeId },
      include: { project: true, task: true, profile: true, period: true },
      orderBy: { period: { periodNumber: 'asc' } },
    }),

    prisma.timesheetEntry.findMany({
      where: { employeeId },
      orderBy: { workDate: 'asc' },
    }),
  ])

  const assignments = rawAssignments.map(a => ({
    projectId: a.project.id,
    projectName: a.project.name,
    taskId: a.task.id,
    taskName: a.task.name,
    profileId: a.profile.id,
    profileName: a.profile.name,
    periodId: a.period.id,
    periodNumber: a.period.periodNumber,
    days: a.days,
  }))

  return c.json({
    ...employee,
    costRateHistory: costRates.map(cr => ({
      validFrom: cr.validFrom,
      validTo: cr.validTo,
      costRatePerDay: cr.costRatePerDay,
    })),
    assignments,
    timesheets,
  })
})
