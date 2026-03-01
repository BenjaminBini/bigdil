import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const referenceDataRouter = new Hono()

// GET /api/reference-data — { profiles, employees, clients }
referenceDataRouter.get('/', async (c) => {
  const [allProfiles, allEmployees, allClients] = await Promise.all([
    prisma.profile.findMany({ orderBy: { name: 'asc' } }),
    prisma.employee.findMany({
      orderBy: { name: 'asc' },
      include: { costRates: { orderBy: { validFrom: 'asc' } } },
    }),
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
  ])

  const employeesWithHistory = allEmployees.map(emp => ({
    id: emp.id,
    name: emp.name,
    active: emp.active,
    currentCostRatePerDay: emp.currentCostRatePerDay,
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
