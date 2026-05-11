import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { toIsoDate, toIsoDateOrNull } from '../lib/dates.js'

export const referenceDataRouter = new Hono()

// GET /api/reference-data — { profiles, employees, clients }
referenceDataRouter.get('/', async (c) => {
  const [allProfiles, allEmployees, allClients, activeSlots] = await Promise.all([
    prisma.profile.findMany({ orderBy: { name: 'asc' } }),
    prisma.employee.findMany({
      orderBy: { name: 'asc' },
      include: { costRates: { orderBy: { validFrom: 'asc' } } },
    }),
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
    // Distinct (employee, project) pairs from currently-active project slots.
    // Active = not closed AND (no endDate OR today <= endDate). startDate gate
    // omitted so upcoming projects with assignments still count for capacity.
    prisma.assignmentSlot.findMany({
      where: {
        employeeId: { not: null },
        project: {
          closedAt: null,
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      },
      select: { employeeId: true, projectId: true },
      distinct: ['employeeId', 'projectId'],
    }),
  ])

  const projectCountByEmployee = new Map<string, number>()
  for (const row of activeSlots) {
    if (row.employeeId) {
      projectCountByEmployee.set(row.employeeId, (projectCountByEmployee.get(row.employeeId) ?? 0) + 1)
    }
  }

  const employeesWithHistory = allEmployees.map(emp => ({
    id: emp.id,
    name: emp.name,
    active: emp.active,
    currentCostRatePerDay: emp.currentCostRatePerDay,
    assignedProjectCount: projectCountByEmployee.get(emp.id) ?? 0,
    costRateHistory: emp.costRates.map(cr => ({
      validFrom: toIsoDate(cr.validFrom),
      validTo: toIsoDateOrNull(cr.validTo),
      costRatePerDay: cr.costRatePerDay,
    })),
  }))

  return c.json({ profiles: allProfiles, employees: employeesWithHistory, clients: allClients })
})
