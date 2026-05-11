import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const dashboardRouter = new Hono()

// GET /api/dashboard — cross-project KPIs, alerts, recent activity
dashboardRouter.get('/', async (c) => {
  const [allProjectsRaw, contractResult, latestSnapshots, overdueApprovals, recentActivity] = await Promise.all([
    prisma.project.findMany({ include: { client: true } }),
    prisma.quoteLine.aggregate({
      _sum: { revenueAmount: true },
      where: { quote: { status: 'VALIDATED' } },
    }),
    prisma.snapshot.findMany({
      include: { metrics: true },
      orderBy: { monthCode: 'desc' },
    }),
    prisma.timesheet.count({ where: { status: 'SUBMITTED' } }),
    prisma.snapshot.findMany({
      orderBy: { snapshotAt: 'desc' },
      take: 10,
    }),
  ])

  const todayIso = new Date().toISOString().slice(0, 10)
  function isActive(p: { startDate: Date | null; endDate: Date | null; closedAt: Date | null }): boolean {
    if (p.closedAt) return false
    if (p.startDate && todayIso < p.startDate.toISOString().slice(0, 10)) return false
    if (p.endDate && todayIso > p.endDate.toISOString().slice(0, 10)) return false
    return true
  }

  const allProjects = allProjectsRaw.map(p => ({
    id: p.id,
    name: p.name,
    clientName: p.client.name,
    isActive: isActive(p),
  }))

  const totalContractValue = contractResult._sum.revenueAmount ?? 0

  const latestByProject = new Map<string, number>()
  for (const s of latestSnapshots) {
    if (!latestByProject.has(s.projectId)) {
      latestByProject.set(s.projectId, s.metrics?.marginForecast ?? 0)
    }
  }
  const totalMarginForecast = Array.from(latestByProject.values()).reduce((sum, v) => sum + v, 0)

  const activeProjects = allProjects.filter(p => p.isActive).length

  // Period status is now derived globally from GlobalTimesheetWindow; no per-project
  // closure list. (See period-utils.deriveTimesheetWindowStatus.) Future: surface the
  // current open month here once a global month-freeze workflow exists.
  const periodsNeedingClosure: Array<{ periodCode: string; projectId: string; projectName: string }> = []

  return c.json({
    kpis: {
      totalContractValue,
      totalMarginForecast,
      activeProjects,
      overdueApprovals,
    },
    activeProjectsList: allProjects.filter(p => p.isActive),
    recentActivity,
    alerts: {
      periodsNeedingClosure,
      overdueApprovals,
    },
  })
})
