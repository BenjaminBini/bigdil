import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const dashboardRouter = new Hono()

// GET /api/dashboard — cross-project KPIs, alerts, recent activity
dashboardRouter.get('/', async (c) => {
  const [allProjectsRaw, contractResult, latestSnapshots, overdueApprovals, recentActivity, consolidationPeriodsRaw] = await Promise.all([
    prisma.project.findMany({ include: { client: true } }),
    prisma.quoteLine.aggregate({
      _sum: { revenueAmount: true },
      where: { quote: { status: 'VALIDATED' } },
    }),
    prisma.snapshot.findMany({
      include: { metrics: true },
      orderBy: { periodNumber: 'desc' },
    }),
    prisma.timesheetEntry.count({ where: { status: 'SUBMITTED' } }),
    prisma.snapshot.findMany({
      orderBy: { snapshotAt: 'desc' },
      take: 10,
    }),
    prisma.period.findMany({
      where: { status: 'CONSOLIDATION' },
      include: { project: true },
    }),
  ])

  const allProjects = allProjectsRaw.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    clientName: p.client.name,
  }))

  const totalContractValue = contractResult._sum.revenueAmount ?? 0

  // Deduplicate to get latest snapshot per project
  const latestByProject = new Map<string, number>()
  for (const s of latestSnapshots) {
    if (!latestByProject.has(s.projectId)) {
      latestByProject.set(s.projectId, s.metrics?.marginForecast ?? 0)
    }
  }
  const totalMarginForecast = Array.from(latestByProject.values()).reduce((sum, v) => sum + v, 0)

  const activeProjects = allProjects.filter(p => p.status === 'IN_PROGRESS').length

  const periodsNeedingClosure = consolidationPeriodsRaw.map(p => ({
    periodId: p.id,
    periodNumber: p.periodNumber,
    projectId: p.projectId,
    projectName: p.project.name,
  }))

  return c.json({
    kpis: {
      totalContractValue,
      totalMarginForecast,
      activeProjects,
      overdueApprovals,
    },
    activeProjectsList: allProjects.filter(p => p.status === 'IN_PROGRESS'),
    recentActivity,
    alerts: {
      periodsNeedingClosure,
      overdueApprovals,
    },
  })
})
