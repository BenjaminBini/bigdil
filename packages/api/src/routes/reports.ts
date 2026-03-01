import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const reportsRouter = new Hono()

// GET /api/reports/financial — cross-project margin, revenue, cost data
reportsRouter.get('/financial', async (c) => {
  // Get latest snapshot metrics per project
  const allSnapshots = await prisma.snapshot.findMany({
    include: { metrics: true, project: { include: { client: true } } },
    orderBy: { periodNumber: 'desc' },
  })

  // Deduplicate: keep only latest snapshot per project
  const seen = new Set<string>()
  const latestPerProject = allSnapshots.filter(s => {
    if (seen.has(s.projectId)) return false
    seen.add(s.projectId)
    return true
  })

  return c.json(
    latestPerProject
      .filter(s => s.metrics != null)
      .map(s => ({
        projectId: s.projectId,
        projectName: s.project.name,
        clientName: s.project.client?.name ?? null,
        contractValue: s.metrics!.contractValue,
        eacCost: s.metrics!.eacCost,
        marginForecast: s.metrics!.marginForecast,
        marginPercent: s.metrics!.contractValue > 0
          ? (s.metrics!.marginForecast / s.metrics!.contractValue) * 100
          : 0,
        actualCostToDate: s.metrics!.actualCostToDate,
        producedValueToDate: s.metrics!.producedExecutionValueToDate,
      }))
  )
})

// GET /api/reports/utilization — employee utilization rates over time
reportsRouter.get('/utilization', async (c) => {
  const allTimesheets = await prisma.timesheetEntry.findMany({
    where: { status: 'APPROVED' },
    include: { employee: true, period: true },
    orderBy: [{ employee: { name: 'asc' } }, { period: { periodNumber: 'asc' } }],
  })

  // Group by employee, then by period
  const byEmployee = new Map<string, {
    employeeId: string
    employeeName: string
    periods: Array<{ periodNumber: number; days: number; utilization: number }>
  }>()

  for (const row of allTimesheets) {
    if (!byEmployee.has(row.employeeId)) {
      byEmployee.set(row.employeeId, {
        employeeId: row.employeeId,
        employeeName: row.employee.name,
        periods: [],
      })
    }
    const emp = byEmployee.get(row.employeeId)!
    const existing = emp.periods.find(p => p.periodNumber === row.period.periodNumber)
    if (existing) {
      existing.days += row.days
      existing.utilization = (existing.days / 5) * 100
    } else {
      emp.periods.push({
        periodNumber: row.period.periodNumber,
        days: row.days,
        utilization: (row.days / 5) * 100,
      })
    }
  }

  return c.json(Array.from(byEmployee.values()))
})
