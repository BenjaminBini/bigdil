import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { comparePeriodSliceKeys } from '../lib/period-utils.js'

export const reportsRouter = new Hono()

// GET /api/reports/financial — cross-project margin, revenue, cost data
reportsRouter.get('/financial', async (c) => {
  const allSnapshots = await prisma.snapshot.findMany({
    include: { metrics: true, project: { include: { client: true } } },
    orderBy: { monthCode: 'desc' },
  })

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
      })),
  )
})

// GET /api/reports/utilization — employee utilization rates over time
reportsRouter.get('/utilization', async (c) => {
  const allTaskTimesheets = await prisma.taskTimesheet.findMany({
    where: { timesheet: { status: 'APPROVED' } },
    include: { timesheet: { include: { employee: true } } },
    orderBy: [{ timesheet: { employee: { name: 'asc' } } }, { timesheet: { periodKey: 'asc' } }],
  })

  const byEmployee = new Map<string, {
    employeeId: string
    employeeName: string
    periods: Array<{ periodCode: string; days: number; utilization: number }>
  }>()

  for (const row of allTaskTimesheets) {
    const employeeId = row.timesheet.employeeId
    const periodKey = row.timesheet.periodKey
    if (!byEmployee.has(employeeId)) {
      byEmployee.set(employeeId, {
        employeeId,
        employeeName: row.timesheet.employee.name,
        periods: [],
      })
    }
    const emp = byEmployee.get(employeeId)!
    const existing = emp.periods.find(p => p.periodCode === periodKey)
    if (existing) {
      existing.days += row.days
      existing.utilization = (existing.days / 5) * 100
    } else {
      emp.periods.push({
        periodCode: periodKey,
        days: row.days,
        utilization: (row.days / 5) * 100,
      })
    }
  }

  const result = Array.from(byEmployee.values()).map(emp => ({
    ...emp,
    periods: [...emp.periods].sort((a, b) => comparePeriodSliceKeys(a.periodCode, b.periodCode)),
  }))

  return c.json(result)
})
