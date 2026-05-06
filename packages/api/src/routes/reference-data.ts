import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const referenceDataRouter = new Hono()

// GET /api/reference-data — { profiles, employees, clients }
referenceDataRouter.get('/', async (c) => {
  const [allProfiles, allEmployees, allClients, activeAssignments] = await Promise.all([
    prisma.profile.findMany({ orderBy: { name: 'asc' } }),
    prisma.employee.findMany({
      orderBy: { name: 'asc' },
      include: { costRates: { orderBy: { validFrom: 'asc' } } },
    }),
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
    prisma.plannedDay.findMany({
      where: { project: { status: { in: ['IN_PROGRESS', 'TO_PLAN'] } }, employeeId: { not: null } },
      select: { employeeId: true, projectId: true },
      distinct: ['employeeId', 'projectId'],
    }),
  ])

  const projectCountByEmployee = new Map<string, number>()
  for (const row of activeAssignments) {
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
      validFrom: cr.validFrom,
      validTo: cr.validTo,
      costRatePerDay: cr.costRatePerDay,
    })),
  }))

  return c.json({
    profiles: allProfiles,
    employees: employeesWithHistory,
    clients: allClients,
  })
})
