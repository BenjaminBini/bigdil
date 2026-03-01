import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const projectsRouter = new Hono()

// GET /api/projects — list all projects with client info
projectsRouter.get('/', async (c) => {
  const [rows, contractValues] = await Promise.all([
    prisma.project.findMany({
      include: { client: true },
      orderBy: { name: 'asc' },
    }),
    prisma.quoteLine.groupBy({
      by: ['quoteId'],
      _sum: { revenueAmount: true },
      where: { quote: { status: 'VALIDATED' } },
    }),
  ])

  // Build projectId → contract value map via a single quotes lookup
  const validatedQuotes = await prisma.quote.findMany({
    where: { status: 'VALIDATED' },
    select: { id: true, projectId: true },
  })
  const quoteToProject = new Map(validatedQuotes.map(q => [q.id, q.projectId]))
  const contractByProject = new Map<string, number>()
  for (const cv of contractValues) {
    const projectId = quoteToProject.get(cv.quoteId)
    if (projectId) {
      contractByProject.set(projectId, (contractByProject.get(projectId) ?? 0) + (cv._sum.revenueAmount ?? 0))
    }
  }

  return c.json(
    rows.map((project) => ({
      id: project.id,
      clientId: project.clientId,
      clientName: project.client.name,
      name: project.name,
      currency: project.currency,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      contractValue: contractByProject.get(project.id) ?? 0,
    }))
  )
})

// GET /api/projects/:id — project + periods + tasks (hierarchical)
projectsRouter.get('/:id', async (c) => {
  const projectId = c.req.param('id')

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  })

  if (!project) return c.json({ error: 'Project not found' }, 404)

  const [projectTasks, projectPeriods, projectQuotes] = await Promise.all([
    prisma.task.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.period.findMany({
      where: { projectId },
      orderBy: { periodNumber: 'asc' },
    }),
    prisma.quote.findMany({
      where: { projectId },
      include: { lines: true },
    }),
  ])

  // Build hierarchical tasks
  type TaskWithChildren = typeof projectTasks[0] & { children: typeof projectTasks }
  const taskMap = new Map(projectTasks.map(t => [t.id, { ...t, children: [] as typeof projectTasks }]))
  const rootTasks: TaskWithChildren[] = []
  for (const task of taskMap.values()) {
    if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
      taskMap.get(task.parentTaskId)!.children.push(task)
    } else {
      rootTasks.push(task)
    }
  }

  // Contract value
  const validatedLines = projectQuotes
    .filter(q => q.status === 'VALIDATED')
    .flatMap(q => q.lines)
  const contractValue = validatedLines.reduce((sum, l) => sum + l.revenueAmount, 0)

  return c.json({
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name,
    currency: project.currency,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    contractValue,
    tasks: rootTasks,
    flatTasks: projectTasks,
    periods: projectPeriods,
    quotes: projectQuotes.map(q => ({
      ...q,
      lines: q.lines,
    })),
  })
})

// GET /api/projects/:id/work-table — everything the WorkTable component needs
projectsRouter.get('/:id/work-table', async (c) => {
  const projectId = c.req.param('id')

  const [projectPeriods, projectTasks, projectPlannedDays, projectTimesheets, periodStartRows, projectQuotes] = await Promise.all([
    prisma.period.findMany({ where: { projectId }, orderBy: { periodNumber: 'asc' } }),
    prisma.task.findMany({ where: { projectId }, orderBy: { sortOrder: 'asc' } }),
    prisma.plannedDay.findMany({ where: { projectId } }),
    prisma.timesheetEntry.findMany({ where: { projectId } }),
    prisma.profileTaskPeriodStart.findMany({
      where: { period: { projectId } },
    }),
    prisma.quote.findMany({ where: { projectId }, include: { lines: true } }),
  ])

  // Build work table cells from planned days + actuals from approved timesheets
  const frozenPeriodIds = new Set(
    projectPeriods.filter(p => p.status === 'FROZEN' || p.status === 'CONSOLIDATION').map(p => p.id)
  )

  // For frozen/consolidation periods, use actual timesheet data; for others, use planned days
  const cells = [
    // Actuals from approved timesheets for closed periods
    ...projectTimesheets
      .filter(ts => frozenPeriodIds.has(ts.periodId) && ts.status === 'APPROVED')
      .map(ts => ({
        taskId: ts.taskId,
        profileId: ts.profileId,
        employeeId: ts.employeeId,
        periodId: ts.periodId,
        days: ts.days,
        isActual: true,
      })),
    // Planned days for non-frozen periods
    ...projectPlannedDays
      .filter(pd => !frozenPeriodIds.has(pd.periodId))
      .map(pd => ({
        taskId: pd.taskId,
        profileId: pd.profileId,
        employeeId: pd.employeeId,
        periodId: pd.periodId,
        days: pd.days,
        isActual: false,
      })),
  ]

  return c.json({
    periods: projectPeriods,
    tasks: projectTasks,
    cells,
    quotes: projectQuotes,
    periodStarts: periodStartRows,
  })
})

// GET /api/projects/:id/snapshots — list snapshots with metrics
projectsRouter.get('/:id/snapshots', async (c) => {
  const projectId = c.req.param('id')

  const rows = await prisma.snapshot.findMany({
    where: { projectId },
    include: { metrics: true },
    orderBy: { periodNumber: 'asc' },
  })

  return c.json(
    rows.map(r => ({
      ...r,
      metrics: r.metrics ?? null,
      scopeLines: [],
      workTableRows: [],
    }))
  )
})

// GET /api/projects/:id/snapshots/:sid — full snapshot detail
projectsRouter.get('/:id/snapshots/:sid', async (c) => {
  const snapshotId = c.req.param('sid')

  const row = await prisma.snapshot.findUnique({
    where: { id: snapshotId },
    include: { metrics: true },
  })

  if (!row) return c.json({ error: 'Snapshot not found' }, 404)

  return c.json({
    ...row,
    metrics: row.metrics ?? null,
    scopeLines: [],
    workTableRows: [],
  })
})

// GET /api/projects/:id/timesheets — project-level timesheet view
projectsRouter.get('/:id/timesheets', async (c) => {
  const projectId = c.req.param('id')

  const rows = await prisma.timesheetEntry.findMany({
    where: { projectId },
    orderBy: { workDate: 'desc' },
  })

  return c.json(rows)
})
