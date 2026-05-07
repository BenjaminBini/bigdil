import { Hono } from 'hono'
import { prisma } from '@bigdil/db'

export const projectsRouter = new Hono()

function buildWeeklyPeriods(
  projectId: string,
  startDate: string,
  endDate: string,
  openFirst: boolean,
): Array<{ id: string; projectId: string; periodNumber: number; startDate: string; endDate: string; status: 'FUTURE' | 'OPEN' }> {
  const periods = []
  const end = new Date(endDate)
  let current = new Date(startDate)
  let num = 1
  while (current <= end) {
    const pEnd = new Date(current)
    pEnd.setDate(pEnd.getDate() + 6)
    if (pEnd > end) pEnd.setTime(end.getTime())
    periods.push({
      id: crypto.randomUUID(),
      projectId,
      periodNumber: num,
      startDate: current.toISOString().split('T')[0],
      endDate: pEnd.toISOString().split('T')[0],
      status: (openFirst && num === 1 ? 'OPEN' : 'FUTURE') as 'FUTURE' | 'OPEN',
    })
    current.setDate(current.getDate() + 7)
    num++
  }
  return periods
}

function projectShape(p: { id: string; clientId: string; client: { name: string }; name: string; currency: string; status: string; startDate: string | null; endDate: string | null }) {
  return { id: p.id, clientId: p.clientId, clientName: p.client.name, name: p.name, currency: p.currency, status: p.status, startDate: p.startDate, endDate: p.endDate }
}

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

// PATCH /api/projects/:id — update project metadata (name, dates, currency)
projectsRouter.patch('/:id', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{ name?: string; currency?: string; startDate?: string | null; endDate?: string | null }>()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const updated = await prisma.project.update({
    where: { id: projectId },
    include: { client: true },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.currency?.trim() ? { currency: body.currency.trim() } : {}),
      ...(body.startDate !== undefined ? { startDate: body.startDate } : {}),
      ...(body.endDate !== undefined ? { endDate: body.endDate } : {}),
    },
  })

  return c.json({
    id: updated.id,
    clientId: updated.clientId,
    clientName: updated.client.name,
    name: updated.name,
    currency: updated.currency,
    status: updated.status,
    startDate: updated.startDate,
    endDate: updated.endDate,
  })
})

// PATCH /api/projects/:id/status — transition project status
projectsRouter.patch('/:id/status', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{ status: string }>()

  const validTransitions: Record<string, string[]> = {
    DRAFT: ['TO_PLAN'],
    TO_PLAN: ['PLANNING', 'IN_PROGRESS'],
    PLANNING: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const allowed = validTransitions[project.status] ?? []
  if (!allowed.includes(body.status)) {
    return c.json({ error: `Cannot transition from ${project.status} to ${body.status}` }, 400)
  }

  // TO_PLAN → PLANNING: generate all periods as FUTURE (no week opened yet)
  if (project.status === 'TO_PLAN' && body.status === 'PLANNING') {
    if (!project.startDate || !project.endDate) {
      return c.json({ error: 'Project must have start and end dates before planning' }, 400)
    }
    const periods = buildWeeklyPeriods(projectId, project.startDate, project.endDate, false)
    const updated = await prisma.$transaction(async (tx) => {
      await tx.period.createMany({ data: periods })
      return tx.project.update({ where: { id: projectId }, include: { client: true }, data: { status: 'PLANNING' } })
    })
    return c.json(projectShape(updated))
  }

  // TO_PLAN → IN_PROGRESS (legacy direct path) or PLANNING → IN_PROGRESS: open the first period
  if (body.status === 'IN_PROGRESS') {
    if (!project.startDate || !project.endDate) {
      return c.json({ error: 'Project must have start and end dates before starting' }, 400)
    }
    const updated = await prisma.$transaction(async (tx) => {
      // Generate periods only if coming from TO_PLAN (PLANNING already has them)
      if (project.status === 'TO_PLAN') {
        const periods = buildWeeklyPeriods(projectId, project.startDate!, project.endDate!, false)
        await tx.period.createMany({ data: periods })
      }
      // Open the first FUTURE period
      const first = await tx.period.findFirst({ where: { projectId, status: 'FUTURE' }, orderBy: { periodNumber: 'asc' } })
      if (first) await tx.period.update({ where: { id: first.id }, data: { status: 'OPEN' } })
      return tx.project.update({ where: { id: projectId }, include: { client: true }, data: { status: 'IN_PROGRESS' } })
    })
    return c.json(projectShape(updated))
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    include: { client: true },
    data: { status: body.status as 'DRAFT' | 'TO_PLAN' | 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' },
  })

  return c.json(projectShape(updated))
})

// POST /api/projects — create a new project
projectsRouter.post('/', async (c) => {
  const body = await c.req.json<{
    clientId: string
    name: string
    currency: string
    startDate?: string | null
    endDate?: string | null
  }>()

  if (!body.clientId?.trim() || !body.name?.trim() || !body.currency?.trim()) {
    return c.json({ error: 'clientId, name and currency are required' }, 400)
  }

  const project = await prisma.project.create({
    data: {
      id: crypto.randomUUID(),
      clientId: body.clientId,
      name: body.name.trim(),
      currency: body.currency.trim(),
      status: 'DRAFT',
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
    },
    include: { client: true },
  })

  return c.json({
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name,
    currency: project.currency,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    contractValue: 0,
  }, 201)
})

// POST /api/projects/:id/quotes — create a new quote with lines
projectsRouter.post('/:id/quotes', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{
    title: string
    effectiveAt?: string | null
    lines: Array<{ taskId: string; profileId: string; days: number; sellRatePerDay: number; costRateAssumptionPerDay: number }>
  }>()

  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)
  if (!Array.isArray(body.lines)) return c.json({ error: 'lines must be an array' }, 400)

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const quoteId = crypto.randomUUID()
  const quote = await prisma.$transaction(async (tx) => {
    await tx.quote.create({
      data: {
        id: quoteId,
        projectId,
        title: body.title.trim(),
        status: 'DRAFT',
        effectiveAt: body.effectiveAt ?? null,
        validatedAt: null,
      },
    })

    if (body.lines.length > 0) {
      await tx.quoteLine.createMany({
        data: body.lines.map((line) => ({
          id: crypto.randomUUID(),
          quoteId,
          taskId: line.taskId,
          profileId: line.profileId,
          days: line.days,
          sellRatePerDay: line.sellRatePerDay,
          costRateAssumptionPerDay: line.costRateAssumptionPerDay,
          revenueAmount: line.days * line.sellRatePerDay,
          budgetCostAmount: line.days * line.costRateAssumptionPerDay,
        })),
      })
    }

    return tx.quote.findUnique({
      where: { id: quoteId },
      include: { lines: true },
    })
  })

  return c.json(quote, 201)
})

// POST /api/projects/:id/quotes/:quoteId/duplicate — copy quote as new DRAFT
projectsRouter.post('/:id/quotes/:quoteId/duplicate', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const source = await prisma.quote.findFirst({
    where: { id: quoteId, projectId },
    include: { lines: true },
  })
  if (!source) return c.json({ error: 'Quote not found' }, 404)

  const newQuoteId = crypto.randomUUID()
  const duplicate = await prisma.$transaction(async (tx) => {
    await tx.quote.create({
      data: {
        id: newQuoteId,
        projectId,
        title: `${source.title} (copy)`,
        status: 'DRAFT',
        effectiveAt: source.effectiveAt,
        validatedAt: null,
      },
    })

    if (source.lines.length > 0) {
      await tx.quoteLine.createMany({
        data: source.lines.map((line) => ({
          id: crypto.randomUUID(),
          quoteId: newQuoteId,
          taskId: line.taskId,
          profileId: line.profileId,
          days: line.days,
          sellRatePerDay: line.sellRatePerDay,
          costRateAssumptionPerDay: line.costRateAssumptionPerDay,
          revenueAmount: line.revenueAmount,
          budgetCostAmount: line.budgetCostAmount,
        })),
      })
    }

    return tx.quote.findUnique({ where: { id: newQuoteId }, include: { lines: true } })
  })

  return c.json(duplicate, 201)
})

// POST /api/projects/:id/tasks — create a task or phase
projectsRouter.post('/:id/tasks', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{ name: string; status?: string; parentTaskId?: string | null }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)

  const siblings = await prisma.task.findMany({
    where: { projectId, parentTaskId: body.parentTaskId ?? null },
    select: { sortOrder: true },
  })
  const maxSort = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1)

  const task = await prisma.task.create({
    data: {
      id: crypto.randomUUID(),
      projectId,
      parentTaskId: body.parentTaskId ?? null,
      name: body.name.trim(),
      sortOrder: maxSort + 1,
      status: (body.status as 'planned' | 'active' | 'done') ?? 'planned',
    },
  })

  return c.json(task, 201)
})

// PATCH /api/projects/:id/tasks/:taskId — update a task
projectsRouter.patch('/:id/tasks/:taskId', async (c) => {
  const projectId = c.req.param('id')
  const taskId = c.req.param('taskId')
  const body = await c.req.json<{ name?: string; status?: string }>()

  const existing = await prisma.task.findFirst({ where: { id: taskId, projectId } })
  if (!existing) return c.json({ error: 'Task not found' }, 404)

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.status ? { status: body.status as 'planned' | 'active' | 'done' } : {}),
    },
  })

  return c.json(task)
})

// DELETE /api/projects/:id/tasks/:taskId — delete a task or phase (and all descendants)
projectsRouter.delete('/:id/tasks/:taskId', async (c) => {
  const projectId = c.req.param('id')
  const taskId = c.req.param('taskId')

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } })
  if (!task) return c.json({ error: 'Task not found' }, 404)

  // Collect all descendant task IDs (BFS)
  const allIds: string[] = []
  const queue = [taskId]
  while (queue.length > 0) {
    const current = queue.shift()!
    allIds.push(current)
    const children = await prisma.task.findMany({ where: { parentTaskId: current }, select: { id: true } })
    queue.push(...children.map(c => c.id))
  }

  await prisma.$transaction([
    prisma.snapshotWorkRow.deleteMany({ where: { taskId: { in: allIds } } }),
    prisma.snapshotScopeLine.deleteMany({ where: { taskId: { in: allIds } } }),
    prisma.profileTaskPeriodStart.deleteMany({ where: { taskId: { in: allIds } } }),
    prisma.timesheetEntry.deleteMany({ where: { taskId: { in: allIds } } }),
    prisma.plannedDay.deleteMany({ where: { taskId: { in: allIds } } }),
    prisma.quoteLine.deleteMany({ where: { taskId: { in: allIds } } }),
    // Delete children first (deepest last in allIds, so reverse)
    ...([...allIds].reverse().map(id => prisma.task.delete({ where: { id } }))),
  ])

  return c.json({ ok: true })
})

// POST /api/projects/:id/quotes/:quoteId/validate — validate a quote
projectsRouter.post('/:id/quotes/:quoteId/validate', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT' && quote.status !== 'SENT') {
    return c.json({ error: `Cannot validate a quote with status ${quote.status}` }, 400)
  }

  const today = new Date().toISOString().split('T')[0]
  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'VALIDATED', validatedAt: today },
  })

  return c.json(updated)
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
