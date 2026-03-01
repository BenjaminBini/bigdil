import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const periodTransitionsRouter = new Hono()

// POST /api/projects/:id/periods/:pid/open — FUTURE → OPEN
periodTransitionsRouter.post('/:id/periods/:pid/open', async (c) => {
  const projectId = c.req.param('id')
  const periodId = c.req.param('pid')

  const period = await prisma.period.findUnique({ where: { id: periodId } })
  if (!period) return c.json({ error: 'Period not found' }, 404)
  if (period.status !== 'FUTURE') {
    return c.json({ error: `Cannot open period in status ${period.status}` }, 400)
  }

  // Check: no other OPEN period for this project
  const openCount = await prisma.period.count({
    where: { projectId, status: 'OPEN' },
  })
  if (openCount > 0) {
    return c.json({ error: 'Another period is already OPEN' }, 400)
  }

  const updated = await prisma.period.update({
    where: { id: periodId },
    data: { status: 'OPEN' },
  })

  return c.json(updated)
})

// POST /api/projects/:id/periods/:pid/start-consolidation — OPEN → CONSOLIDATION
periodTransitionsRouter.post('/:id/periods/:pid/start-consolidation', async (c) => {
  const periodId = c.req.param('pid')

  const period = await prisma.period.findUnique({ where: { id: periodId } })
  if (!period) return c.json({ error: 'Period not found' }, 404)
  if (period.status !== 'OPEN') {
    return c.json({ error: `Cannot start consolidation from status ${period.status}` }, 400)
  }

  const updated = await prisma.period.update({
    where: { id: periodId },
    data: { status: 'CONSOLIDATION' },
  })

  return c.json(updated)
})

// POST /api/projects/:id/periods/:pid/freeze — CONSOLIDATION → FROZEN
periodTransitionsRouter.post('/:id/periods/:pid/freeze', async (c) => {
  const projectId = c.req.param('id')
  const periodId = c.req.param('pid')

  const period = await prisma.period.findUnique({ where: { id: periodId } })
  if (!period) return c.json({ error: 'Period not found' }, 404)
  if (period.status !== 'CONSOLIDATION') {
    return c.json({ error: `Cannot freeze period in status ${period.status}` }, 400)
  }

  // Check: all timesheets for this period are APPROVED
  const nonApprovedCount = await prisma.timesheetEntry.count({
    where: {
      periodId,
      status: { not: 'APPROVED' },
    },
  })
  if (nonApprovedCount > 0) {
    return c.json({ error: `${nonApprovedCount} timesheet(s) not yet approved` }, 400)
  }

  const today = new Date().toISOString().split('T')[0]
  const snapshotId = `snap_${Date.now()}`

  const result = await prisma.$transaction(async (tx) => {
    // Compute snapshot — parallelize independent reads
    const [periodTimesheets, contractResult, totalCostResult, totalProdResult, remainingPlanned, costAssumptions, allPeriods] = await Promise.all([
      tx.timesheetEntry.findMany({ where: { periodId, status: 'APPROVED' } }),
      tx.quoteLine.aggregate({
        _sum: { revenueAmount: true },
        where: { quote: { projectId, status: 'VALIDATED' } },
      }),
      tx.timesheetEntry.aggregate({
        _sum: { appliedCostAmount: true },
        where: { projectId, status: 'APPROVED' },
      }),
      tx.timesheetEntry.aggregate({
        _sum: { appliedSellAmount: true },
        where: { projectId, status: 'APPROVED' },
      }),
      tx.plannedDay.findMany({
        where: {
          projectId,
          period: {
            status: { not: 'FROZEN' },
            id: { not: periodId },
          },
        },
      }),
      tx.quoteLine.findMany({
        where: { quote: { projectId, status: 'VALIDATED' } },
        select: { taskId: true, profileId: true, costRateAssumptionPerDay: true },
      }),
      tx.period.findMany({ where: { projectId } }),
    ])

    const executedDaysPeriod = periodTimesheets.reduce((s, ts) => s + ts.days, 0)
    const producedExecutionValuePeriod = periodTimesheets.reduce(
      (s, ts) => s + (ts.appliedSellAmount ?? 0), 0
    )
    const contractValue = contractResult._sum.revenueAmount ?? 0
    const actualCostToDate = totalCostResult._sum.appliedCostAmount ?? 0
    const producedExecutionValueToDate = totalProdResult._sum.appliedSellAmount ?? 0

    const costRateMap = new Map<string, number>()
    for (const ca of costAssumptions) {
      costRateMap.set(`${ca.taskId}|${ca.profileId}`, ca.costRateAssumptionPerDay)
    }

    const etcCost = remainingPlanned.reduce((sum, row) => {
      const key = `${row.taskId}|${row.profileId}`
      const rate = costRateMap.get(key) ?? 0
      return sum + row.days * rate
    }, 0)

    const eacCost = actualCostToDate + etcCost
    const marginForecast = contractValue - eacCost
    const netBurnValuePeriod = producedExecutionValuePeriod

    // Create snapshot with nested metrics
    await tx.snapshot.create({
      data: {
        id: snapshotId,
        projectId,
        periodId,
        periodNumber: period.periodNumber,
        snapshotAt: today,
        frozenAt: today,
        closedBy: 'u1', // hardcoded current user
        notes: `Period ${period.periodNumber} frozen`,
        metrics: {
          create: {
            contractValue,
            actualCostToDate,
            etcCost,
            eacCost,
            marginForecast,
            executedDaysPeriod,
            producedExecutionValuePeriod,
            producedExecutionValueToDate,
            netBurnValuePeriod,
          },
        },
      },
    })

    // Update period status
    const updated = await tx.period.update({
      where: { id: periodId },
      data: { status: 'FROZEN', frozenAt: today },
    })

    // Create period-start data for the next period
    const nextPeriod = allPeriods.find(p => p.periodNumber === period.periodNumber + 1)

    if (nextPeriod) {
      const [futurePlanned, soldDaysRows] = await Promise.all([
        tx.plannedDay.findMany({
          where: {
            projectId,
            period: { periodNumber: { gte: nextPeriod.periodNumber } },
          },
        }),
        tx.quoteLine.groupBy({
          by: ['taskId', 'profileId'],
          _sum: { days: true },
          where: { quote: { projectId, status: 'VALIDATED' } },
        }),
      ])

      const soldMap = new Map<string, number>()
      for (const s of soldDaysRows) {
        soldMap.set(`${s.taskId}|${s.profileId}`, s._sum.days ?? 0)
      }

      const remainingMap = new Map<string, number>()
      for (const row of futurePlanned) {
        const key = `${row.taskId}|${row.profileId}`
        remainingMap.set(key, (remainingMap.get(key) ?? 0) + row.days)
      }

      const periodStartEntries = [...remainingMap.entries()].map(([key, remaining]) => {
        const [taskId, profileId] = key.split('|')
        return {
          id: `ps_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          taskId,
          profileId,
          periodId: nextPeriod.id,
          remainingAtStart: remaining,
          soldAtStart: soldMap.get(key) ?? 0,
        }
      })

      if (periodStartEntries.length > 0) {
        await tx.profileTaskPeriodStart.createMany({ data: periodStartEntries })
      }
    }

    return updated
  })

  return c.json({
    period: result,
    snapshotId,
  })
})
