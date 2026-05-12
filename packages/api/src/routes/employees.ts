import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { auditLog } from '../lib/audit.js'
import { comparePeriodSliceKeys, parsePeriodSliceKey } from '../lib/period-utils.js'
import { fromIsoDate, toIsoDate, toIsoDateOrNull } from '../lib/dates.js'
import { ensureTimesheetForEmployee } from '../lib/timesheet-provisioning.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'

export const employeesRouter = new Hono()

// POST /api/employees — create a new employee + initial cost rate
employeesRouter.post('/', async (c) => {
  const body = await c.req.json<{ name: string; currentCostRatePerDay: number }>()

  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400)
  if (typeof body.currentCostRatePerDay !== 'number' || body.currentCostRatePerDay < 0) {
    return c.json({ error: 'currentCostRatePerDay must be a non-negative number' }, 400)
  }

  const today = new Date()

  const employee = await prisma.$transaction(async (tx) => {
    const created = await tx.employee.create({
      data: {
        name: body.name.trim(),
        active: true,
        currentCostRatePerDay: body.currentCostRatePerDay,
      },
    })

    await tx.employeeCostRate.create({
      data: {
        employeeId: created.id,
        validFrom: today,
        costRatePerDay: body.currentCostRatePerDay,
      },
    })

    // Auto-provision a CONSULTANT User linked to the new employee. This is
    // what wires the "Incarner" button on the collaborators page — admins
    // can impersonate the consultant straight after creation. Email is
    // derived from the name with the new cuid's last 6 chars as a unique
    // suffix to avoid collisions.
    const slug = body.name
      .trim()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '.')
      .toLowerCase()
      .replace(/^\.+|\.+$/g, '') || 'user'
    const email = `${slug}.${created.id.slice(-6)}@bigdil.local`
    await tx.user.create({
      data: {
        email,
        name: body.name.trim(),
        role: 'CONSULTANT',
        employeeId: created.id,
      },
    })

    return created
  })
  await auditLog({ entity: 'Employee', entityId: employee.id, action: 'CREATE', after: employee })

  // Provision a Timesheet for the current open period so the new employee
  // can immediately log work. No assignments yet → empty bundle; entries
  // appear later as PlannedDays land for them.
  const window = await requireGlobalTimesheetWindow()
  await ensureTimesheetForEmployee(employee.id, window.openPeriodKey)

  return c.json({
    id: employee.id,
    name: employee.name,
    active: employee.active,
    currentCostRatePerDay: employee.currentCostRatePerDay,
    costRateHistory: [{ validFrom: toIsoDate(today), validTo: null, costRatePerDay: body.currentCostRatePerDay }],
  }, 201)
})

// POST /api/employees/:id/rates — add a new cost rate period
employeesRouter.post('/:id/rates', async (c) => {
  const employeeId = c.req.param('id')
  const body = await c.req.json<{ validFrom: string; costRatePerDay: number }>()

  if (!body.validFrom) return c.json({ error: 'validFrom is required' }, 400)
  if (typeof body.costRatePerDay !== 'number' || body.costRatePerDay < 0) {
    return c.json({ error: 'costRatePerDay must be a non-negative number' }, 400)
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  const validFromDate = fromIsoDate(body.validFrom)

  await prisma.$transaction(async (tx) => {
    const openRate = await tx.employeeCostRate.findFirst({
      where: { employeeId, validTo: null },
      orderBy: { validFrom: 'desc' },
    })

    if (openRate) {
      const prevDate = new Date(validFromDate.getTime() - 86400000)
      await tx.employeeCostRate.update({
        where: { id: openRate.id },
        data: { validTo: prevDate },
      })
    }

    await tx.employeeCostRate.create({
      data: {
        employeeId,
        validFrom: validFromDate,
        costRatePerDay: body.costRatePerDay,
      },
    })

    await tx.employee.update({
      where: { id: employeeId },
      data: { currentCostRatePerDay: body.costRatePerDay },
    })
  })
  await auditLog({
    entity: 'EmployeeCostRate', entityId: employeeId, action: 'CREATE',
    after: { employeeId, validFrom: body.validFrom, costRatePerDay: body.costRatePerDay },
  })

  return c.json({ success: true })
})

// GET /api/employees/:id — employee detail + assignments + utilization
employeesRouter.get('/:id', async (c) => {
  const employeeId = c.req.param('id')

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  // Assignments are now expressed via AssignmentSlot. Pull all slots for this
  // employee, then their planned-days, joined with project/task/profile data.
  const [costRates, slots, timesheets] = await Promise.all([
    prisma.employeeCostRate.findMany({ where: { employeeId }, orderBy: { validFrom: 'asc' } }),
    prisma.assignmentSlot.findMany({
      where: { employeeId },
      include: {
        project: true,
        task: true,
        profile: true,
        plannedDays: true,
      },
    }),
    prisma.taskTimesheet.findMany({
      where: { timesheet: { employeeId } },
      include: {
        timesheet: true,
        assignmentSlot: { select: { projectId: true, taskId: true, profileId: true } },
      },
      orderBy: { workDate: 'asc' },
    }),
  ])

  const assignments = slots.flatMap(slot =>
    slot.plannedDays.map(pd => {
      const parsed = parsePeriodSliceKey(pd.periodKey)
      return {
        projectId: slot.project.id,
        projectName: slot.project.name,
        taskId: slot.task.id,
        taskName: slot.task.name,
        profileId: slot.profile.id,
        profileName: slot.profile.name,
        periodCode: pd.periodKey,
        periodKey: pd.periodKey,
        weekCode: parsed.weekCode,
        monthCode: parsed.monthCode,
        days: pd.days,
      }
    }),
  ).sort((a, b) => comparePeriodSliceKeys(a.periodKey, b.periodKey))

  return c.json({
    ...employee,
    costRateHistory: costRates.map(cr => ({
      validFrom: toIsoDate(cr.validFrom),
      validTo: toIsoDateOrNull(cr.validTo),
      costRatePerDay: cr.costRatePerDay,
    })),
    assignments,
    timesheets: timesheets.map(ts => ({
      id: ts.id,
      timesheetId: ts.timesheetId,
      employeeId: ts.timesheet.employeeId,
      assignmentSlotId: ts.assignmentSlotId,
      projectId: ts.assignmentSlot.projectId,
      taskId: ts.assignmentSlot.taskId,
      profileId: ts.assignmentSlot.profileId,
      periodKey: ts.timesheet.periodKey,
      periodCode: ts.timesheet.periodKey,
      workDate: toIsoDate(ts.workDate),
      days: ts.days,
      notes: ts.notes,
      status: ts.timesheet.status,
      submittedAt: toIsoDateOrNull(ts.timesheet.submittedAt),
      approvedAt: toIsoDateOrNull(ts.timesheet.approvedAt),
      rejectedAt: toIsoDateOrNull(ts.timesheet.rejectedAt),
      appliedCostRatePerDay: ts.appliedCostRatePerDay,
      appliedCostAmount: ts.appliedCostAmount,
      appliedSellRatePerDay: ts.appliedSellRatePerDay,
      appliedSellAmount: ts.appliedSellAmount,
    })),
  })
})

// DELETE /api/employees/:id — only if no live data attached
//
// Allowed if the employee has:
//   - no linked User account
//   - no AssignmentSlots
//   - no Timesheets outside DRAFT status
// On success: cascade-delete DRAFT timesheets (and their TaskTimesheets) and
// the EmployeeCostRate history, then the employee. Anything else blocks.
employeesRouter.delete('/:id', async (c) => {
  const employeeId = c.req.param('id')

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  const [userLink, slotCount, blockingTimesheetCount] = await Promise.all([
    prisma.user.findUnique({ where: { employeeId } }),
    prisma.assignmentSlot.count({ where: { employeeId } }),
    prisma.timesheet.count({
      where: { employeeId, status: { not: 'DRAFT' } },
    }),
  ])

  const reasons: string[] = []
  if (userLink) reasons.push('linked to a user account')
  if (slotCount > 0) reasons.push(`assigned to ${slotCount} project slot${slotCount > 1 ? 's' : ''}`)
  if (blockingTimesheetCount > 0) {
    reasons.push(`has ${blockingTimesheetCount} non-draft timesheet${blockingTimesheetCount > 1 ? 's' : ''}`)
  }
  if (reasons.length > 0) {
    return c.json({ error: `Cannot delete employee: ${reasons.join('; ')}` }, 409)
  }

  await prisma.$transaction([
    prisma.taskTimesheet.deleteMany({ where: { timesheet: { employeeId } } }),
    prisma.timesheet.deleteMany({ where: { employeeId } }),
    prisma.employeeCostRate.deleteMany({ where: { employeeId } }),
    prisma.employee.delete({ where: { id: employeeId } }),
  ])
  await auditLog({ entity: 'Employee', entityId: employeeId, action: 'DELETE', before: employee })

  return c.json({ success: true })
})
