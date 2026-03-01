import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const employeesRouter = new Hono()

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
