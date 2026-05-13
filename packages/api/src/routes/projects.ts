import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import type { Currency } from '@bigdil/db'
import {
  getPeriodDates,
  getPeriodLabel,
  getPeriodSlicesForDateRange,
  getPeriodsForDateRange,
  comparePeriodCodes,
  comparePeriodSliceKeys,
  deriveTimesheetWindowStatus,
  monthCodeForDate,
  parsePeriodSliceKey,
} from '../lib/period-utils.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'
import { auditLog } from '../lib/audit.js'
import { fromIsoDate, toIsoDate, toIsoDateOrNull } from '../lib/dates.js'
import { requireCurrentUser } from '../lib/current-user.js'
import {
  buildScopeLines,
  buildWorkRows,
  computeSnapshotMetrics,
  loadSnapshotInputs,
  periodKeyMatchesMonth,
} from '../lib/snapshot-builder.js'

export const projectsRouter = new Hono()

const VALID_CURRENCIES = new Set<Currency>(['EUR', 'USD', 'GBP', 'CHF', 'CAD'])

function asCurrency(input: string | undefined): Currency | undefined {
  if (!input) return undefined
  const upper = input.trim().toUpperCase() as Currency
  return VALID_CURRENCIES.has(upper) ? upper : undefined
}

// Project is "active" when not closed and today falls inside its date range
// (or when one/both bounds are missing — in that case the present side acts
// as half-open). Used by dashboards, filters, and the project header.
function isProjectActive(p: { startDate: Date | null; endDate: Date | null; closedAt: Date | null }): boolean {
  if (p.closedAt) return false
  const todayIso = new Date().toISOString().slice(0, 10)
  const startIso = toIsoDateOrNull(p.startDate)
  const endIso = toIsoDateOrNull(p.endDate)
  if (startIso && todayIso < startIso) return false
  if (endIso && todayIso > endIso) return false
  return true
}

function projectShape(p: {
  id: string
  clientId: string
  client: { name: string }
  name: string
  currency: Currency
  startDate: Date | null
  endDate: Date | null
  closedAt: Date | null
}) {
  return {
    id: p.id,
    clientId: p.clientId,
    clientName: p.client.name,
    name: p.name,
    currency: p.currency,
    startDate: toIsoDateOrNull(p.startDate),
    endDate: toIsoDateOrNull(p.endDate),
    closedAt: p.closedAt ? p.closedAt.toISOString() : null,
    isActive: isProjectActive(p),
  }
}

function quoteShape<T extends {
  sentAt: Date | null
  effectiveAt: Date | null
  validatedAt: Date | null
  rejectedAt: Date | null
  cancelledAt: Date | null
}>(q: T) {
  return {
    ...q,
    sentAt: toIsoDateOrNull(q.sentAt),
    effectiveAt: toIsoDateOrNull(q.effectiveAt),
    validatedAt: toIsoDateOrNull(q.validatedAt),
    rejectedAt: toIsoDateOrNull(q.rejectedAt),
    cancelledAt: toIsoDateOrNull(q.cancelledAt),
  }
}

// Enrich monthly period codes with dates/labels/status (used by GET /:id).
// All projects now operate on weekly slices; this helper produces a monthly
// rollup view for the project header / summary screens.
function enrichPeriods(codes: string[], openPeriodKey: string) {
  return [...codes].sort(comparePeriodCodes).map(code => ({
    code,
    periodKey: code,
    monthCode: code,
    weekCode: null as string | null,
    ...getPeriodDates(code),
    label: getPeriodLabel(code),
    groupCode: code,
    groupLabel: getPeriodLabel(code),
    status: deriveTimesheetWindowStatus(code, openPeriodKey),
    frozenAt: null as string | null,
  }))
}

// GET /api/projects — list all projects with client info and contract value
projectsRouter.get('/', async (c) => {
  const [rows, contractValues] = await Promise.all([
    prisma.project.findMany({ include: { client: true }, orderBy: { name: 'asc' } }),
    prisma.quoteLine.groupBy({
      by: ['quoteId'],
      _sum: { revenueAmount: true },
      where: { quote: { status: 'VALIDATED' } },
    }),
  ])

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
    rows.map(project => ({
      id: project.id,
      clientId: project.clientId,
      clientName: project.client.name,
      name: project.name,
      currency: project.currency,
      startDate: toIsoDateOrNull(project.startDate),
      endDate: toIsoDateOrNull(project.endDate),
      closedAt: project.closedAt ? project.closedAt.toISOString() : null,
      isActive: isProjectActive(project),
      contractValue: contractByProject.get(project.id) ?? 0,
    })),
  )
})

// GET /api/projects/:id — project detail with accounting periods, tasks, quotes
projectsRouter.get('/:id', async (c) => {
  const projectId = c.req.param('id')

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const [projectPhases, projectQuotes, globalWindow] = await Promise.all([
    prisma.phase.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.quote.findMany({ where: { projectId }, include: { lines: true } }),
    requireGlobalTimesheetWindow(),
  ])

  const flatTasks = projectPhases.flatMap(p => p.tasks)

  const contractValue = projectQuotes
    .filter(q => q.status === 'VALIDATED')
    .flatMap(q => q.lines)
    .reduce((sum, l) => sum + l.revenueAmount, 0)

  // Project-level summary periods are monthly accounting periods.
  const periodCodeSet = new Set<string>()
  if (project.startDate && project.endDate) {
    for (const code of getPeriodsForDateRange(toIsoDate(project.startDate), toIsoDate(project.endDate), 'MONTHLY')) {
      periodCodeSet.add(code)
    }
  }
  const periods = enrichPeriods([...periodCodeSet], globalWindow.openPeriodKey)

  return c.json({
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name,
    currency: project.currency,
    startDate: toIsoDateOrNull(project.startDate),
    endDate: toIsoDateOrNull(project.endDate),
    closedAt: project.closedAt ? project.closedAt.toISOString() : null,
    isActive: isProjectActive(project),
    contractValue,
    phases: projectPhases,
    flatTasks,
    periods,
    quotes: projectQuotes.map(quoteShape),
  })
})

// GET /api/projects/:id/work-table — everything the WorkTable component needs
projectsRouter.get('/:id/work-table', async (c) => {
  const projectId = c.req.param('id')

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  // PlannedDays/Timesheets join via assignmentSlot now.
  const slotInclude = {
    assignmentSlot: { select: { projectId: true, taskId: true, profileId: true, employeeId: true } },
  } as const

  const [projectPhases, projectPlannedDays, projectTimesheets, periodStartRows, projectQuotes, globalWindow] = await Promise.all([
    prisma.phase.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.plannedDay.findMany({ where: { assignmentSlot: { projectId } }, include: slotInclude }),
    prisma.taskTimesheet.findMany({
      where: { assignmentSlot: { projectId } },
      include: { ...slotInclude, timesheet: { select: { periodKey: true, status: true } } },
    }),
    prisma.profileTaskPeriodStart.findMany({ where: { task: { phase: { projectId } } } }),
    prisma.quote.findMany({ where: { projectId }, include: { lines: true } }),
    requireGlobalTimesheetWindow(),
  ])

  const projectTasks = projectPhases.flatMap(p => p.tasks)

  // Build weekly period slices from project date range, planned days, and timesheets.
  const periodSliceMap = new Map<string, ReturnType<typeof getPeriodSlicesForDateRange>[number]>()
  if (project.startDate && project.endDate) {
    for (const slice of getPeriodSlicesForDateRange(toIsoDate(project.startDate), toIsoDate(project.endDate), 'WEEKLY')) {
      periodSliceMap.set(slice.code, slice)
    }
  }
  const remember = (periodKey: string) => {
    if (periodSliceMap.has(periodKey)) return
    const parsed = parsePeriodSliceKey(periodKey)
    const refCode = parsed.weekCode ?? parsed.monthCode
    periodSliceMap.set(periodKey, {
      code: periodKey,
      periodKey,
      monthCode: parsed.monthCode,
      weekCode: parsed.weekCode,
      ...getPeriodDates(refCode),
      label: getPeriodLabel(refCode),
      groupCode: parsed.monthCode,
      groupLabel: getPeriodLabel(parsed.monthCode),
    })
  }
  for (const pd of projectPlannedDays) remember(pd.periodKey)
  for (const ts of projectTimesheets) remember(ts.timesheet.periodKey)

  // Single source of truth for period status: derived from the global timesheet window.
  const periods = [...periodSliceMap.values()]
    .sort((a, b) => comparePeriodSliceKeys(a.periodKey, b.periodKey))
    .map(slice => ({
      ...slice,
      status: deriveTimesheetWindowStatus(slice.periodKey, globalWindow.openPeriodKey),
      frozenAt: null as string | null,
    }))

  // Cell value rule:
  //   - For FROZEN / CONSOLIDATION slices → always use TaskTimesheet sum
  //     (any bundle status). Past slices reflect declared work.
  //   - For OPEN slices → use TaskTimesheet sum ONLY if the bundle has
  //     been SUBMITTED or APPROVED. Draft / Rejected drafts still show
  //     the planning numbers so cells don't visibly "shrink" while the
  //     consultant is mid-input.
  //   - FUTURE → planning numbers.
  const pastSliceKeys = new Set(
    periods.filter(p => p.status === 'FROZEN' || p.status === 'CONSOLIDATION').map(p => p.periodKey),
  )

  type CellKey = string
  const cellKey = (taskId: string, profileId: string, employeeId: string | null, periodKey: string) =>
    `${taskId}|${profileId}|${employeeId ?? ''}|${periodKey}`

  const timesheetTotals = new Map<CellKey, number>()
  for (const ts of projectTimesheets) {
    const isPast = pastSliceKeys.has(ts.timesheet.periodKey)
    const isLockedOpen = ts.timesheet.status === 'SUBMITTED' || ts.timesheet.status === 'APPROVED'
    if (!isPast && !isLockedOpen) continue
    const key = cellKey(ts.assignmentSlot.taskId, ts.assignmentSlot.profileId, ts.assignmentSlot.employeeId, ts.timesheet.periodKey)
    timesheetTotals.set(key, (timesheetTotals.get(key) ?? 0) + ts.days)
  }

  const timesheetCells = [...timesheetTotals.entries()].map(([key, days]) => {
    const [taskId, profileId, employeeRaw, periodKey] = key.split('|')
    const employeeId = employeeRaw === '' ? null : employeeRaw
    const parsed = parsePeriodSliceKey(periodKey)
    return {
      taskId,
      profileId,
      employeeId,
      periodCode: periodKey,
      periodKey,
      weekCode: parsed.weekCode,
      monthCode: parsed.monthCode,
      days,
      isActual: true,
    }
  })

  // Planned days suppressed for any (cell) already provided by a timesheet
  // entry above — covers OPEN slices with SUBMITTED/APPROVED bundles too.
  const timesheetCellKeys = new Set(timesheetTotals.keys())
  const cells = [
    ...timesheetCells,
    ...projectPlannedDays
      .filter(pd =>
        !timesheetCellKeys.has(
          cellKey(pd.assignmentSlot.taskId, pd.assignmentSlot.profileId, pd.assignmentSlot.employeeId, pd.periodKey),
        ),
      )
      .map(pd => {
        const parsed = parsePeriodSliceKey(pd.periodKey)
        return {
          taskId: pd.assignmentSlot.taskId,
          profileId: pd.assignmentSlot.profileId,
          employeeId: pd.assignmentSlot.employeeId,
          periodCode: pd.periodKey,
          periodKey: pd.periodKey,
          weekCode: parsed.weekCode,
          monthCode: parsed.monthCode,
          days: pd.days,
          isActual: false,
        }
      }),
  ]

  // RAF (remaining days) per (task, profile, employee) at the start of the
  // current CONSOLIDATION month. Built from:
  //   1. Most-recent snapshot strictly before the consolidation month: sum
  //      plannedDays over non-FROZEN periodStatus rows (per emp).
  //   2. Initial allocations of every VALIDATED quote effective by the
  //      consolidation month and validated since that prior snapshot (or
  //      every such quote if no prior snapshot).
  // Drives the consolidation table revenue formula at every level:
  //   period_revenue = (RAF_prev − RAF_now) × sellRate.
  // For the first consolidation with no prior snapshot, sources reduce to (2).
  const consolidationMonthCode = periods.find(p => p.status === 'CONSOLIDATION')?.monthCode ?? null
  let previousSnapshotRaf: Array<{
    taskId: string
    profileId: string
    employeeId: string | null
    days: number
  }> = []
  let previousSnapshotMonthCode: string | null = null
  let previousSnapshotAt: string | null = null
  if (consolidationMonthCode) {
    const allSnapshots = await prisma.snapshot.findMany({
      where: { projectId },
      select: { id: true, monthCode: true, snapshotAt: true },
    })
    const prevSnapshot = allSnapshots
      .filter(s => comparePeriodCodes(s.monthCode, consolidationMonthCode) < 0)
      .sort((a, b) => comparePeriodCodes(b.monthCode, a.monthCode))[0] ?? null

    type RafKey = string
    const rafKey = (taskId: string, profileId: string, employeeId: string | null) =>
      `${taskId}::${profileId}::${employeeId ?? '__null__'}` satisfies RafKey
    const acc = new Map<RafKey, { taskId: string; profileId: string; employeeId: string | null; days: number }>()
    const bump = (taskId: string, profileId: string, employeeId: string | null, days: number) => {
      const k = rafKey(taskId, profileId, employeeId)
      const existing = acc.get(k)
      if (existing) existing.days += days
      else acc.set(k, { taskId, profileId, employeeId, days })
    }

    if (prevSnapshot) {
      previousSnapshotMonthCode = prevSnapshot.monthCode
      previousSnapshotAt = toIsoDate(prevSnapshot.snapshotAt)
      const prevWorkRows = await prisma.snapshotWorkRow.findMany({
        where: { snapshotId: prevSnapshot.id, periodStatus: { not: 'FROZEN' } },
        select: { taskId: true, profileId: true, employeeId: true, plannedDays: true },
      })
      for (const w of prevWorkRows) {
        bump(w.taskId, w.profileId, w.employeeId, w.plannedDays)
      }
    }

    // Stack initial allocations of quotes validated since prevSnapshot (or all
    // validated quotes effective by consolidation month if no prior snapshot).
    const newQuotes = await prisma.quote.findMany({
      where: {
        projectId,
        status: 'VALIDATED',
        effectiveAt: { not: null },
        ...(prevSnapshot ? { validatedAt: { gt: prevSnapshot.snapshotAt } } : {}),
      },
      include: { lines: { include: { initialAllocations: true } } },
    })
    for (const q of newQuotes) {
      if (!q.effectiveAt) continue
      const effMonth = monthCodeForDate(toIsoDate(q.effectiveAt))
      if (comparePeriodCodes(effMonth, consolidationMonthCode) > 0) continue
      for (const line of q.lines) {
        for (const a of line.initialAllocations) {
          bump(line.taskId, line.profileId, a.employeeId, a.days)
        }
      }
    }

    previousSnapshotRaf = [...acc.values()]
  }

  return c.json({
    periods,
    phases: projectPhases,
    tasks: projectTasks,
    cells,
    quotes: projectQuotes.map(quoteShape),
    periodStarts: periodStartRows,
    previousSnapshotRaf,
    previousSnapshotMonthCode,
    previousSnapshotAt,
  })
})

// GET /api/projects/:id/snapshots — list snapshots with metrics
projectsRouter.get('/:id/snapshots', async (c) => {
  const projectId = c.req.param('id')

  const rows = await prisma.snapshot.findMany({
    where: { projectId },
    include: { metrics: true },
    orderBy: { monthCode: 'asc' },
  })

  return c.json(
    rows.map(r => ({
      ...r,
      periodCode: r.monthCode,
      snapshotAt: toIsoDate(r.snapshotAt),
      metrics: r.metrics ?? null,
      scopeLines: [],
      workTableRows: [],
    })),
  )
})

// GET /api/projects/:id/snapshots/:sid — full snapshot detail
projectsRouter.get('/:id/snapshots/:sid', async (c) => {
  const snapshotId = c.req.param('sid')

  const row = await prisma.snapshot.findUnique({
    where: { id: snapshotId },
    include: { metrics: true, scopeLines: true, workRows: true },
  })
  if (!row) return c.json({ error: 'Snapshot not found' }, 404)

  return c.json({
    ...row,
    periodCode: row.monthCode,
    snapshotAt: toIsoDate(row.snapshotAt),
    metrics: row.metrics ?? null,
    scopeLines: row.scopeLines,
    workTableRows: row.workRows.map(w => ({
      snapshotId: w.snapshotId,
      periodCode: w.periodKey,
      periodKey: w.periodKey,
      periodStatus: w.periodStatus,
      taskId: w.taskId,
      profileId: w.profileId,
      employeeId: w.employeeId,
      plannedDays: w.plannedDays,
      actualDays: w.actualDays,
    })),
  })
})

// POST /api/projects/:id/snapshots — freeze a month into a snapshot
projectsRouter.post('/:id/snapshots', async (c) => {
  const projectId = c.req.param('id')
  const raw = await c.req.json().catch(() => ({}))
  const monthCode = typeof raw?.monthCode === 'string' ? raw.monthCode : null
  if (!monthCode || !/^\d{4}M\d{1,2}$/.test(monthCode)) {
    return c.json({ error: 'monthCode is required (format: 2026M5)' }, 400)
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const window = await requireGlobalTimesheetWindow()
  const openMonth = parsePeriodSliceKey(window.openPeriodKey).monthCode
  if (comparePeriodCodes(monthCode, openMonth) >= 0) {
    return c.json({ error: 'Month must be strictly before the current open month' }, 400)
  }

  const existing = await prisma.snapshot.findUnique({
    where: { projectId_monthCode: { projectId, monthCode } },
  })
  if (existing) return c.json({ error: 'Snapshot already exists for this month' }, 409)

  // All Timesheets touching any of this project's slots for this month must
  // be APPROVED. Distinct timesheets via the slot reverse relation.
  const monthTimesheets = await prisma.timesheet.findMany({
    where: {
      taskTimesheets: { some: { assignmentSlot: { projectId } } },
    },
    select: { id: true, status: true, periodKey: true, employeeId: true },
  })
  const offenders = monthTimesheets.filter((t) =>
    periodKeyMatchesMonth(t.periodKey, monthCode) && t.status !== 'APPROVED',
  )
  if (offenders.length > 0) {
    return c.json(
      {
        error: 'All timesheets in this month must be APPROVED before snapshot',
        offenders: offenders.map((t) => ({
          timesheetId: t.id,
          employeeId: t.employeeId,
          periodKey: t.periodKey,
          status: t.status,
        })),
      },
      409,
    )
  }

  const actor = await requireCurrentUser()

  // Initial-allocation gate. Every VALIDATED quote effective by the snapshot
  // month, validated since the previous snapshot, must carry a balanced
  // initial allocation on every line. The balanced allocations become the
  // per-(task, profile, employee) RAF baseline for downstream period-revenue
  // computations. Block creation with 422 + details if anything is missing.
  const priorSnapshots = await prisma.snapshot.findMany({
    where: { projectId },
    select: { id: true, monthCode: true, snapshotAt: true },
  })
  const prevSnapshot =
    priorSnapshots
      .filter((s) => comparePeriodCodes(s.monthCode, monthCode) < 0)
      .sort((a, b) => comparePeriodCodes(b.monthCode, a.monthCode))[0] ?? null

  const candidateQuotes = await prisma.quote.findMany({
    where: {
      projectId,
      status: 'VALIDATED',
      effectiveAt: { not: null },
      ...(prevSnapshot ? { validatedAt: { gt: prevSnapshot.snapshotAt } } : {}),
    },
    include: {
      lines: { include: { initialAllocations: true } },
    },
  })

  // effective by end of snapshot month: monthCodeForDate(effectiveAt) <= monthCode.
  const quotesNeedingAllocation = candidateQuotes.filter((q) => {
    if (!q.effectiveAt) return false
    const effMonth = monthCodeForDate(toIsoDate(q.effectiveAt))
    return comparePeriodCodes(effMonth, monthCode) <= 0
  })

  const missingLines: Array<{
    quoteId: string
    quoteTitle: string
    lineId: string
    taskId: string
    profileId: string
    quotedDays: number
    allocatedDays: number
  }> = []
  for (const q of quotesNeedingAllocation) {
    for (const line of q.lines) {
      const allocated = line.initialAllocations.reduce((s, a) => s + a.days, 0)
      const balanced =
        line.initialAllocations.length > 0 && Math.abs(allocated - line.days) <= 0.01
      if (!balanced) {
        missingLines.push({
          quoteId: q.id,
          quoteTitle: q.title,
          lineId: line.id,
          taskId: line.taskId,
          profileId: line.profileId,
          quotedDays: line.days,
          allocatedDays: allocated,
        })
      }
    }
  }
  if (missingLines.length > 0) {
    return c.json(
      {
        error: 'missing_initial_allocations',
        message:
          'Snapshot blocked: every quote validated since the previous snapshot must have a balanced initial allocation on every line.',
        missing: missingLines,
      },
      422,
    )
  }

  const inputs = await loadSnapshotInputs(projectId, monthCode)
  const metrics = computeSnapshotMetrics(inputs)
  const scopeLines = buildScopeLines(inputs)
  const workRows = buildWorkRows(inputs, (periodKey) =>
    deriveTimesheetWindowStatus(periodKey, window.openPeriodKey),
  )

  const snapshot = await prisma.$transaction(async (tx) => {
    // Global month-freeze record. Idempotent across projects: many snapshots
    // can attach to the same MonthFreeze.
    await tx.monthFreeze.upsert({
      where: { monthCode },
      update: {},
      create: {
        monthCode,
        frozenById: actor.id,
        notes: '',
      },
    })

    return tx.snapshot.create({
      data: {
        projectId,
        monthCode,
        monthFreezeId: monthCode,
        closedById: actor.id,
        notes: '',
        metrics: { create: metrics },
        scopeLines: {
          create: scopeLines.map((s) => ({
            taskId: s.taskId,
            profileId: s.profileId,
            baselineDaysTotalAsofSnapshot: s.baselineDaysTotalAsofSnapshot,
            sellRatePerDay: s.sellRatePerDay,
            costRateAssumptionPerDay: s.costRateAssumptionPerDay,
            baselineRevenueTotal: s.baselineRevenueTotal,
            baselineBudgetCostTotal: s.baselineBudgetCostTotal,
          })),
        },
        workRows: {
          create: workRows.map((w) => ({
            periodKey: w.periodKey,
            periodStatus: w.periodStatus,
            taskId: w.taskId,
            profileId: w.profileId,
            employeeId: w.employeeId,
            plannedDays: w.plannedDays,
            actualDays: w.actualDays,
          })),
        },
      },
      include: { metrics: true, scopeLines: true, workRows: true },
    })
  })
  // Lock consumed initial allocations to this snapshot. Skips rows already
  // locked by an earlier snapshot — those remain associated with their original
  // snapshot for audit clarity.
  const consumedAllocationIds = quotesNeedingAllocation.flatMap((q) =>
    q.lines.flatMap((l) => l.initialAllocations.map((a) => a.id)),
  )
  if (consumedAllocationIds.length > 0) {
    await prisma.quoteInitialAllocation.updateMany({
      where: { id: { in: consumedAllocationIds }, firstUsedInSnapshotId: null },
      data: { firstUsedInSnapshotId: snapshot.id },
    })
  }

  await auditLog({ entity: 'Snapshot', entityId: snapshot.id, action: 'CREATE', after: { projectId, monthCode } })

  return c.json({
    ...snapshot,
    periodCode: snapshot.monthCode,
    snapshotAt: toIsoDate(snapshot.snapshotAt),
    metrics: snapshot.metrics ?? null,
    scopeLines: snapshot.scopeLines,
    workTableRows: snapshot.workRows,
  }, 201)
})

// PATCH /api/projects/:id — update project metadata (name, dates, currency)
projectsRouter.patch('/:id', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{
    name?: string
    currency?: string
    startDate?: string | null
    endDate?: string | null
  }>()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const data: {
    name?: string
    currency?: Currency
    startDate?: Date | null
    endDate?: Date | null
  } = {}
  if (body.name?.trim()) data.name = body.name.trim()
  const currency = asCurrency(body.currency)
  if (currency) data.currency = currency
  if (body.startDate !== undefined) data.startDate = body.startDate ? fromIsoDate(body.startDate) : null
  if (body.endDate !== undefined) data.endDate = body.endDate ? fromIsoDate(body.endDate) : null

  const updated = await prisma.project.update({
    where: { id: projectId },
    include: { client: true },
    data,
  })
  await auditLog({ entity: 'Project', entityId: projectId, action: 'UPDATE', before: project, after: updated })
  return c.json(projectShape(updated))
})

// POST /api/projects/:id/close — close a project (explicit early closure or
// formal end-of-engagement). Sets closedAt to now. Idempotent: closing an
// already-closed project just refreshes the timestamp.
projectsRouter.post('/:id/close', async (c) => {
  const projectId = c.req.param('id')
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const updated = await prisma.project.update({
    where: { id: projectId },
    include: { client: true },
    data: { closedAt: new Date() },
  })
  await auditLog({ entity: 'Project', entityId: projectId, action: 'UPDATE', before: project, after: updated, metadata: { transition: 'CLOSE' } })
  return c.json(projectShape(updated))
})

// POST /api/projects/:id/reopen — clear closedAt. Project's active status
// then derives purely from its date range.
projectsRouter.post('/:id/reopen', async (c) => {
  const projectId = c.req.param('id')
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const updated = await prisma.project.update({
    where: { id: projectId },
    include: { client: true },
    data: { closedAt: null },
  })
  await auditLog({ entity: 'Project', entityId: projectId, action: 'UPDATE', before: project, after: updated, metadata: { transition: 'REOPEN' } })
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
  const currency = asCurrency(body.currency)
  if (!currency) return c.json({ error: 'currency must be one of: EUR, USD, GBP, CHF, CAD' }, 400)

  const project = await prisma.project.create({
    data: {
      clientId: body.clientId,
      name: body.name.trim(),
      currency,
      startDate: body.startDate ? fromIsoDate(body.startDate) : null,
      endDate: body.endDate ? fromIsoDate(body.endDate) : null,
    },
    include: { client: true },
  })
  await auditLog({ entity: 'Project', entityId: project.id, action: 'CREATE', after: project })

  return c.json({ ...projectShape(project), contractValue: 0 }, 201)
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

  const quote = await prisma.$transaction(async (tx) => {
    const created = await tx.quote.create({
      data: {
        projectId,
        title: body.title.trim(),
        status: 'DRAFT',
        effectiveAt: body.effectiveAt ? fromIsoDate(body.effectiveAt) : null,
      },
    })

    if (body.lines.length > 0) {
      await tx.quoteLine.createMany({
        data: body.lines.map(line => ({
          quoteId: created.id,
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

    return tx.quote.findUnique({ where: { id: created.id }, include: { lines: true } })
  })
  if (quote) await auditLog({ entity: 'Quote', entityId: quote.id, action: 'CREATE', after: quote })
  return c.json(quote ? quoteShape(quote) : null, 201)
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

  const duplicate = await prisma.$transaction(async (tx) => {
    const created = await tx.quote.create({
      data: {
        projectId,
        title: `${source.title} (copy)`,
        status: 'DRAFT',
        effectiveAt: source.effectiveAt,
      },
    })

    if (source.lines.length > 0) {
      await tx.quoteLine.createMany({
        data: source.lines.map(line => ({
          quoteId: created.id,
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

    return tx.quote.findUnique({ where: { id: created.id }, include: { lines: true } })
  })

  return c.json(duplicate ? quoteShape(duplicate) : null, 201)
})

// POST /api/projects/:id/phases — create a phase
projectsRouter.post('/:id/phases', async (c) => {
  const projectId = c.req.param('id')
  const body = await c.req.json<{ name: string }>()
  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)

  const siblings = await prisma.phase.findMany({ where: { projectId }, select: { sortOrder: true } })
  const maxSort = siblings.reduce((max, p) => Math.max(max, p.sortOrder), -1)

  const phase = await prisma.phase.create({
    data: { projectId, name: body.name.trim(), sortOrder: maxSort + 1 },
  })
  await auditLog({ entity: 'Phase', entityId: phase.id, action: 'CREATE', after: phase })
  return c.json(phase, 201)
})

// PATCH /api/projects/:id/phases/:phaseId — rename a phase
projectsRouter.patch('/:id/phases/:phaseId', async (c) => {
  const projectId = c.req.param('id')
  const phaseId = c.req.param('phaseId')
  const body = await c.req.json<{ name?: string }>()

  const existing = await prisma.phase.findFirst({ where: { id: phaseId, projectId } })
  if (!existing) return c.json({ error: 'Phase not found' }, 404)

  const phase = await prisma.phase.update({
    where: { id: phaseId },
    data: { ...(body.name?.trim() ? { name: body.name.trim() } : {}) },
  })
  await auditLog({ entity: 'Phase', entityId: phase.id, action: 'UPDATE', before: existing, after: phase })
  return c.json(phase)
})

// DELETE /api/projects/:id/phases/:phaseId — delete a phase and all its tasks
projectsRouter.delete('/:id/phases/:phaseId', async (c) => {
  const projectId = c.req.param('id')
  const phaseId = c.req.param('phaseId')

  const phase = await prisma.phase.findFirst({ where: { id: phaseId, projectId }, include: { tasks: { select: { id: true } } } })
  if (!phase) return c.json({ error: 'Phase not found' }, 404)

  const taskIds = phase.tasks.map(t => t.id)

  await prisma.$transaction([
    prisma.snapshotWorkRow.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.snapshotScopeLine.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.profileTaskPeriodStart.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.taskTimesheet.deleteMany({ where: { assignmentSlot: { taskId: { in: taskIds } } } }),
    prisma.plannedDay.deleteMany({ where: { assignmentSlot: { taskId: { in: taskIds } } } }),
    prisma.assignmentSlot.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.quoteLine.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
    prisma.phase.delete({ where: { id: phaseId } }),
  ])
  await auditLog({ entity: 'Phase', entityId: phaseId, action: 'DELETE', before: phase })
  return c.json({ ok: true })
})

// POST /api/projects/:id/phases/:phaseId/tasks — create a task in a phase
projectsRouter.post('/:id/phases/:phaseId/tasks', async (c) => {
  const projectId = c.req.param('id')
  const phaseId = c.req.param('phaseId')
  const body = await c.req.json<{ name: string; status?: string }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)

  const phase = await prisma.phase.findFirst({ where: { id: phaseId, projectId } })
  if (!phase) return c.json({ error: 'Phase not found' }, 404)

  const siblings = await prisma.task.findMany({ where: { phaseId }, select: { sortOrder: true } })
  const maxSort = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1)

  const task = await prisma.task.create({
    data: {
      phaseId,
      name: body.name.trim(),
      sortOrder: maxSort + 1,
      status: (body.status as 'planned' | 'active' | 'done') ?? 'planned',
    },
  })
  await auditLog({ entity: 'Task', entityId: task.id, action: 'CREATE', after: task })
  return c.json(task, 201)
})

// PATCH /api/projects/:id/tasks/:taskId — update a task (rename / status)
projectsRouter.patch('/:id/tasks/:taskId', async (c) => {
  const projectId = c.req.param('id')
  const taskId = c.req.param('taskId')
  const body = await c.req.json<{ name?: string; status?: string }>()

  const existing = await prisma.task.findFirst({ where: { id: taskId, phase: { projectId } } })
  if (!existing) return c.json({ error: 'Task not found' }, 404)

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.status ? { status: body.status as 'planned' | 'active' | 'done' } : {}),
    },
  })
  await auditLog({ entity: 'Task', entityId: task.id, action: 'UPDATE', before: existing, after: task })
  return c.json(task)
})

// DELETE /api/projects/:id/tasks/:taskId — delete a task and all its dependents
projectsRouter.delete('/:id/tasks/:taskId', async (c) => {
  const projectId = c.req.param('id')
  const taskId = c.req.param('taskId')

  const task = await prisma.task.findFirst({ where: { id: taskId, phase: { projectId } } })
  if (!task) return c.json({ error: 'Task not found' }, 404)

  await prisma.$transaction([
    prisma.snapshotWorkRow.deleteMany({ where: { taskId } }),
    prisma.snapshotScopeLine.deleteMany({ where: { taskId } }),
    prisma.profileTaskPeriodStart.deleteMany({ where: { taskId } }),
    prisma.taskTimesheet.deleteMany({ where: { assignmentSlot: { taskId } } }),
    prisma.plannedDay.deleteMany({ where: { assignmentSlot: { taskId } } }),
    prisma.assignmentSlot.deleteMany({ where: { taskId } }),
    prisma.quoteLine.deleteMany({ where: { taskId } }),
    prisma.task.delete({ where: { id: taskId } }),
  ])
  await auditLog({ entity: 'Task', entityId: taskId, action: 'DELETE', before: task })

  return c.json({ ok: true })
})

// POST /api/projects/:id/quotes/:quoteId/lines — add a line to a DRAFT quote
projectsRouter.post('/:id/quotes/:quoteId/lines', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')
  const body = await c.req.json<{
    taskId: string
    profileId: string
    days: number
    sellRatePerDay: number
    costRateAssumptionPerDay: number
  }>()

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') return c.json({ error: 'Only DRAFT quotes can be edited' }, 400)

  const line = await prisma.quoteLine.create({
    data: {
      quoteId,
      taskId: body.taskId,
      profileId: body.profileId,
      days: body.days,
      sellRatePerDay: body.sellRatePerDay,
      costRateAssumptionPerDay: body.costRateAssumptionPerDay,
      revenueAmount: body.days * body.sellRatePerDay,
      budgetCostAmount: body.days * body.costRateAssumptionPerDay,
    },
  })
  await auditLog({ entity: 'QuoteLine', entityId: line.id, action: 'CREATE', after: line })
  return c.json(line, 201)
})

// PATCH /api/projects/:id/quotes/:quoteId/lines/:lineId — update a line
projectsRouter.patch('/:id/quotes/:quoteId/lines/:lineId', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')
  const lineId = c.req.param('lineId')
  const body = await c.req.json<{ days?: number; sellRatePerDay?: number; costRateAssumptionPerDay?: number }>()

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') return c.json({ error: 'Only DRAFT quotes can be edited' }, 400)

  const current = await prisma.quoteLine.findFirst({ where: { id: lineId, quoteId } })
  if (!current) return c.json({ error: 'Line not found' }, 404)

  const days = body.days ?? current.days
  const sellRate = body.sellRatePerDay ?? current.sellRatePerDay
  const costRate = body.costRateAssumptionPerDay ?? current.costRateAssumptionPerDay

  const updated = await prisma.quoteLine.update({
    where: { id: lineId },
    data: {
      days,
      sellRatePerDay: sellRate,
      costRateAssumptionPerDay: costRate,
      revenueAmount: days * sellRate,
      budgetCostAmount: days * costRate,
    },
  })
  await auditLog({ entity: 'QuoteLine', entityId: lineId, action: 'UPDATE', before: current, after: updated })
  return c.json(updated)
})

// DELETE /api/projects/:id/quotes/:quoteId/lines/:lineId — remove a line
projectsRouter.delete('/:id/quotes/:quoteId/lines/:lineId', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')
  const lineId = c.req.param('lineId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') return c.json({ error: 'Only DRAFT quotes can be edited' }, 400)

  const line = await prisma.quoteLine.findFirst({ where: { id: lineId, quoteId } })
  if (!line) return c.json({ error: 'Line not found' }, 404)

  await prisma.quoteLine.delete({ where: { id: lineId } })
  await auditLog({ entity: 'QuoteLine', entityId: lineId, action: 'DELETE', before: line })
  return c.json({ ok: true })
})

// Quote workflow state machine (see ADR / docs):
//   DRAFT --send--> SENT --validate--> VALIDATED --unvalidate--> SENT
//                       \--reject----> REJECTED --reopen--> DRAFT
//                                              \--cancel--> CANCELLED (terminal)
//   DRAFT --cancel--> CANCELLED (terminal)
//
// A quote in any status may be hard-deleted iff it has no planned days
// (sum of lines.days) and no tracked time on its tasks.
// Transitions are enforced server-side; UI must mirror.

// POST /api/projects/:id/quotes/:quoteId/send — DRAFT → SENT
projectsRouter.post('/:id/quotes/:quoteId/send', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId }, include: { lines: true } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') {
    return c.json({ error: `Cannot send a quote with status ${quote.status}` }, 400)
  }
  if (quote.lines.length === 0) {
    return c.json({ error: 'Cannot send an empty quote' }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'SENT', sentAt: new Date() },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'SEND' } })
  return c.json(quoteShape(updated))
})

// POST /api/projects/:id/quotes/:quoteId/validate — SENT → VALIDATED
projectsRouter.post('/:id/quotes/:quoteId/validate', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const body = await c.req.json<{ validatedAt?: string | null; effectiveAt?: string | null }>().catch(() => ({} as { validatedAt?: string | null; effectiveAt?: string | null }))
  const effectiveAtRaw = body.effectiveAt?.trim()
  if (!effectiveAtRaw) {
    return c.json({ error: 'effectiveAt is required to validate a quote' }, 400)
  }
  const effectiveAt = fromIsoDate(effectiveAtRaw)
  if (Number.isNaN(effectiveAt.getTime())) {
    return c.json({ error: 'effectiveAt must be a valid ISO date (YYYY-MM-DD)' }, 400)
  }

  const validatedAt = body.validatedAt ? fromIsoDate(body.validatedAt) : new Date()

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'SENT') {
    return c.json({ error: `Cannot validate a quote with status ${quote.status} (must be SENT)` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'VALIDATED', validatedAt, effectiveAt },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'VALIDATE' } })
  return c.json(quoteShape(updated))
})

// POST /api/projects/:id/quotes/:quoteId/reject — SENT → REJECTED
projectsRouter.post('/:id/quotes/:quoteId/reject', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'SENT') {
    return c.json({ error: `Cannot reject a quote with status ${quote.status} (must be SENT)` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'REJECTED', rejectedAt: new Date() },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'REJECT' } })
  return c.json(quoteShape(updated))
})

// POST /api/projects/:id/quotes/:quoteId/cancel — DRAFT or REJECTED → CANCELLED
projectsRouter.post('/:id/quotes/:quoteId/cancel', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  const cancellable: string[] = ['DRAFT', 'REJECTED']
  if (!cancellable.includes(quote.status)) {
    return c.json({ error: `Cannot cancel a quote with status ${quote.status} (must be DRAFT or REJECTED)` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'CANCEL' } })
  return c.json(quoteShape(updated))
})

// POST /api/projects/:id/quotes/:quoteId/reopen — REJECTED → DRAFT
projectsRouter.post('/:id/quotes/:quoteId/reopen', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  if (quote.status !== 'REJECTED') {
    return c.json({ error: `Cannot reopen a quote with status ${quote.status} (must be REJECTED)` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'DRAFT', sentAt: null, rejectedAt: null },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'REOPEN' } })
  return c.json(quoteShape(updated))
})

// POST /api/projects/:id/quotes/:quoteId/unvalidate — VALIDATED → SENT
// Clears validatedAt + effectiveAt so the quote can be re-validated (e.g.,
// with a corrected effective date) or rejected.
projectsRouter.post('/:id/quotes/:quoteId/unvalidate', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'VALIDATED') {
    return c.json({ error: `Cannot unvalidate a quote with status ${quote.status} (must be VALIDATED)` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'SENT', validatedAt: null, effectiveAt: null },
    include: { lines: true },
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'UPDATE', before: quote, after: updated, metadata: { transition: 'UNVALIDATE' } })
  return c.json(quoteShape(updated))
})

// DELETE /api/projects/:id/quotes/:quoteId — hard delete (any status)
// Allowed only when the quote has zero planned days AND zero tracked time
// against any of its tasks. Otherwise return 400 so the caller knows to
// cancel/unvalidate instead.
projectsRouter.delete('/:id/quotes/:quoteId', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, projectId },
    include: { lines: true },
  })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  const plannedDays = quote.lines.reduce((sum, line) => sum + line.days, 0)
  if (plannedDays > 0) {
    return c.json({ error: 'Cannot delete a quote with planned days. Remove its lines first.' }, 400)
  }

  const taskIds = quote.lines.map((line) => line.taskId)
  if (taskIds.length > 0) {
    const spentCount = await prisma.taskTimesheet.count({
      where: {
        days: { gt: 0 },
        assignmentSlot: { projectId, taskId: { in: taskIds } },
      },
    })
    if (spentCount > 0) {
      return c.json({ error: 'Cannot delete a quote with tracked time on its tasks.' }, 400)
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.quoteLine.deleteMany({ where: { quoteId } })
    await tx.quote.delete({ where: { id: quoteId } })
  })
  await auditLog({ entity: 'Quote', entityId: quoteId, action: 'DELETE', before: quote })
  return c.json({ ok: true })
})

// ── Quote initial allocations (répartition initiale) ───────────────────────
// Per-employee day allocation of a VALIDATED quote's lines. Used as the
// baseline RAF at snapshot time. Allocations are locked once a snapshot
// has consumed them. Quote must be VALIDATED to accept allocations.

// GET /api/projects/:id/quotes/:quoteId/allocations
projectsRouter.get('/:id/quotes/:quoteId/allocations', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, projectId },
    include: {
      lines: {
        include: {
          initialAllocations: true,
        },
      },
    },
  })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  const lines = quote.lines.map((line) => {
    const lockedBy = line.initialAllocations.find((a) => a.firstUsedInSnapshotId != null)?.firstUsedInSnapshotId ?? null
    const allocatedDays = line.initialAllocations.reduce((s, a) => s + a.days, 0)
    return {
      lineId: line.id,
      taskId: line.taskId,
      profileId: line.profileId,
      quotedDays: line.days,
      allocatedDays,
      balanced: Math.abs(allocatedDays - line.days) <= 0.01,
      lockedBy,
      allocations: line.initialAllocations.map((a) => ({
        id: a.id,
        employeeId: a.employeeId,
        days: a.days,
      })),
    }
  })

  return c.json({ quoteId, status: quote.status, lines })
})

// PUT /api/projects/:id/quotes/:quoteId/lines/:lineId/allocations
// Body: { allocations: [{ employeeId: string, days: number }] }
// Replaces all allocations on the line. Rejects when:
//   - quote is not VALIDATED
//   - any existing allocation on the line is firstUsedInSnapshotId != null (locked)
//   - any allocation has invalid employeeId or non-positive days
//   - Σ allocations.days != line.days (tolerance 0.01)
projectsRouter.put('/:id/quotes/:quoteId/lines/:lineId/allocations', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')
  const lineId = c.req.param('lineId')

  type AllocBody = { allocations?: Array<{ employeeId?: string; days?: number }> }
  const body = await c.req.json<AllocBody>().catch(() => ({} as AllocBody))
  const allocations = Array.isArray(body.allocations) ? body.allocations : null
  if (!allocations) {
    return c.json({ error: 'allocations array is required' }, 400)
  }

  const line = await prisma.quoteLine.findFirst({
    where: { id: lineId, quoteId, quote: { projectId } },
    include: {
      quote: { select: { status: true } },
      initialAllocations: { select: { id: true, firstUsedInSnapshotId: true } },
    },
  })
  if (!line) return c.json({ error: 'Quote line not found' }, 404)
  if (line.quote.status !== 'VALIDATED') {
    return c.json({ error: 'Quote must be VALIDATED to edit allocations' }, 400)
  }

  const lockedBy = line.initialAllocations.find((a) => a.firstUsedInSnapshotId != null)
  if (lockedBy) {
    return c.json({ error: 'Allocations are locked: already consumed by a snapshot', snapshotId: lockedBy.firstUsedInSnapshotId }, 409)
  }

  // Validate input rows.
  const cleanedById = new Map<string, number>()
  for (const a of allocations) {
    if (typeof a.employeeId !== 'string' || a.employeeId.length === 0) {
      return c.json({ error: 'each allocation must have an employeeId (non-null)' }, 400)
    }
    if (typeof a.days !== 'number' || !Number.isFinite(a.days) || a.days <= 0) {
      return c.json({ error: `allocation for ${a.employeeId} must have positive numeric days` }, 400)
    }
    cleanedById.set(a.employeeId, (cleanedById.get(a.employeeId) ?? 0) + a.days)
  }
  const totalDays = [...cleanedById.values()].reduce((s, d) => s + d, 0)
  if (Math.abs(totalDays - line.days) > 0.01) {
    return c.json(
      { error: `Σ allocations (${totalDays.toFixed(2)}) must equal line.days (${line.days.toFixed(2)})` },
      400,
    )
  }

  // Verify all employee ids exist.
  const employeeIds = [...cleanedById.keys()]
  const existingEmps = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true },
  })
  if (existingEmps.length !== employeeIds.length) {
    const found = new Set(existingEmps.map((e) => e.id))
    const missing = employeeIds.filter((id) => !found.has(id))
    return c.json({ error: 'unknown employeeId(s)', missing }, 400)
  }

  // Replace all allocations atomically.
  const updated = await prisma.$transaction(async (tx) => {
    await tx.quoteInitialAllocation.deleteMany({ where: { quoteLineId: lineId } })
    const rows = await Promise.all(
      [...cleanedById.entries()].map(([employeeId, days]) =>
        tx.quoteInitialAllocation.create({
          data: { quoteLineId: lineId, employeeId, days },
        }),
      ),
    )
    return rows
  })

  await auditLog({
    entity: 'QuoteInitialAllocation',
    entityId: lineId,
    action: 'UPDATE',
    after: { lineId, allocations: updated.map((a) => ({ employeeId: a.employeeId, days: a.days })) },
    metadata: { quoteId, projectId },
  })

  return c.json({
    lineId,
    allocations: updated.map((a) => ({
      id: a.id,
      employeeId: a.employeeId,
      days: a.days,
    })),
  })
})

// GET /api/projects/:id/timesheets — one Timesheet bundle per (employee,
// period) that touches this project. taskTimesheets are pre-filtered to the
// project so PMs of project A don't see entries from project B inside the
// same employee's week. Leave rows are not project-scoped → omitted.
projectsRouter.get('/:id/timesheets', async (c) => {
  const projectId = c.req.param('id')

  const rows = await prisma.timesheet.findMany({
    where: { taskTimesheets: { some: { assignmentSlot: { projectId } } } },
    include: {
      taskTimesheets: {
        where: { assignmentSlot: { projectId } },
        include: {
          assignmentSlot: {
            include: {
              task: { select: { id: true, name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { workDate: 'asc' },
      },
    },
    orderBy: { periodKey: 'desc' },
  })

  return c.json(
    rows.map((r) => ({
      ...r,
      submittedAt: toIsoDateOrNull(r.submittedAt),
      approvedAt: toIsoDateOrNull(r.approvedAt),
      rejectedAt: toIsoDateOrNull(r.rejectedAt),
      taskTimesheets: r.taskTimesheets.map((t) => ({
        ...t,
        workDate: toIsoDate(t.workDate),
      })),
      // Leave is per-employee, not project-scoped — omit from the project view.
      leaveDays: [],
    })),
  )
})
