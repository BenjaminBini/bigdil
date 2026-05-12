import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { leaveDayUpsertSchema, taskTimesheetCreateSchema, taskTimesheetUpdateSchema, timesheetRejectSchema } from './schemas.js'
import { deriveTimesheetWindowStatus, getPeriodDates, parsePeriodSliceKey } from '../lib/period-utils.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'
import { auditLog } from '../lib/audit.js'
import { getCurrentUser } from '../lib/current-user.js'
import { fromIsoDate, toIsoDate, toIsoDateOrNull } from '../lib/dates.js'

export const timesheetMutationsRouter = new Hono()

function taskTimesheetShape<T extends { workDate: Date }>(row: T) {
  return { ...row, workDate: toIsoDate(row.workDate) }
}

function timesheetShape<T extends {
  submittedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  taskTimesheets?: { workDate: Date }[]
}>(row: T) {
  const { taskTimesheets, ...rest } = row
  return {
    ...rest,
    submittedAt: toIsoDateOrNull(rest.submittedAt),
    approvedAt: toIsoDateOrNull(rest.approvedAt),
    rejectedAt: toIsoDateOrNull(rest.rejectedAt),
    taskTimesheets: (taskTimesheets ?? []).map(taskTimesheetShape),
  }
}

async function loadEditableTimesheet(timesheetId: string) {
  const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } })
  if (!timesheet) return { error: 'Timesheet not found' as const, status: 404 as const, timesheet: null }
  if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
    return { error: 'Can only edit DRAFT or REJECTED timesheets' as const, status: 400 as const, timesheet: null }
  }
  // CONSOLIDATION is the late-entry window by design — block only FROZEN
  // (already snapshotted) and FUTURE (premature). A timesheet that lands
  // back in DRAFT/REJECTED inside the consolidation slice must remain
  // editable so the consultant (or impersonating admin) can fix it.
  const window = await requireGlobalTimesheetWindow()
  const sliceStatus = deriveTimesheetWindowStatus(timesheet.periodKey, window.openPeriodKey)
  if (sliceStatus === 'FROZEN' || sliceStatus === 'FUTURE') {
    return { error: 'Frozen and future timesheets are read-only' as const, status: 400 as const, timesheet: null }
  }
  return { error: null, status: null, timesheet }
}

// POST /api/timesheets/:id/entries — upsert a TaskTimesheet for (timesheet, slot, workDate)
//
// Idempotent on the (timesheetId, assignmentSlotId, workDate) triple — the
// schedule grid relies on this to set hours per (task, day) without first
// checking whether a row already exists.
timesheetMutationsRouter.post('/:id/entries', async (c) => {
  const id = c.req.param('id')
  const raw = await c.req.json()
  const result = taskTimesheetCreateSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const body = result.data

  const guard = await loadEditableTimesheet(id)
  if (guard.error) return c.json({ error: guard.error }, guard.status)
  const timesheet = guard.timesheet

  const slot = await prisma.assignmentSlot.findUnique({ where: { id: body.assignmentSlotId } })
  if (!slot) return c.json({ error: 'AssignmentSlot not found' }, 404)
  if (slot.employeeId !== timesheet.employeeId) {
    return c.json({ error: 'AssignmentSlot does not belong to this employee' }, 400)
  }

  const workDate = fromIsoDate(body.workDate)
  const existing = await prisma.taskTimesheet.findUnique({
    where: {
      timesheetId_assignmentSlotId_workDate: {
        timesheetId: timesheet.id,
        assignmentSlotId: slot.id,
        workDate,
      },
    },
  })

  if (existing) {
    const updated = await prisma.taskTimesheet.update({
      where: { id: existing.id },
      data: { days: body.days, notes: body.notes ?? existing.notes },
    })
    await auditLog({ entity: 'TaskTimesheet', entityId: updated.id, action: 'UPDATE', before: existing, after: updated })
    return c.json(taskTimesheetShape(updated))
  }

  const entry = await prisma.taskTimesheet.create({
    data: {
      timesheetId: timesheet.id,
      assignmentSlotId: slot.id,
      workDate,
      days: body.days,
      notes: body.notes ?? '',
    },
  })
  await auditLog({ entity: 'TaskTimesheet', entityId: entry.id, action: 'CREATE', after: entry })

  return c.json(taskTimesheetShape(entry), 201)
})

// PATCH /api/timesheets/:id/entries/:entryId — update days/notes on one entry
timesheetMutationsRouter.patch('/:id/entries/:entryId', async (c) => {
  const id = c.req.param('id')
  const entryId = c.req.param('entryId')
  const raw = await c.req.json()
  const result = taskTimesheetUpdateSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const body = result.data

  const guard = await loadEditableTimesheet(id)
  if (guard.error) return c.json({ error: guard.error }, guard.status)

  const existing = await prisma.taskTimesheet.findUnique({ where: { id: entryId } })
  if (!existing || existing.timesheetId !== id) {
    return c.json({ error: 'Entry not found on this timesheet' }, 404)
  }

  const updates: { days?: number; notes?: string } = {}
  if (body.days !== undefined) updates.days = body.days
  if (body.notes !== undefined) updates.notes = body.notes

  const updated = await prisma.taskTimesheet.update({ where: { id: entryId }, data: updates })
  await auditLog({ entity: 'TaskTimesheet', entityId: entryId, action: 'UPDATE', before: existing, after: updated })

  return c.json(taskTimesheetShape(updated))
})

// DELETE /api/timesheets/:id/entries/:entryId — remove an entry
timesheetMutationsRouter.delete('/:id/entries/:entryId', async (c) => {
  const id = c.req.param('id')
  const entryId = c.req.param('entryId')

  const guard = await loadEditableTimesheet(id)
  if (guard.error) return c.json({ error: guard.error }, guard.status)

  const existing = await prisma.taskTimesheet.findUnique({ where: { id: entryId } })
  if (!existing || existing.timesheetId !== id) {
    return c.json({ error: 'Entry not found on this timesheet' }, 404)
  }

  await prisma.taskTimesheet.delete({ where: { id: entryId } })
  await auditLog({ entity: 'TaskTimesheet', entityId: entryId, action: 'DELETE', before: existing })
  return c.json({ success: true })
})

// POST /api/timesheets/:id/leave — upsert the Congés row for one workday
timesheetMutationsRouter.post('/:id/leave', async (c) => {
  const id = c.req.param('id')
  const raw = await c.req.json()
  const result = leaveDayUpsertSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const body = result.data

  const guard = await loadEditableTimesheet(id)
  if (guard.error) return c.json({ error: guard.error }, guard.status)
  const timesheet = guard.timesheet

  const workDate = fromIsoDate(body.workDate)
  const existing = await prisma.leaveDay.findUnique({
    where: { timesheetId_workDate: { timesheetId: timesheet.id, workDate } },
  })

  if (body.days === 0) {
    if (existing) {
      await prisma.leaveDay.delete({ where: { id: existing.id } })
      await auditLog({ entity: 'LeaveDay', entityId: existing.id, action: 'DELETE', before: existing })
    }
    return c.json({ deleted: true })
  }

  if (existing) {
    const updated = await prisma.leaveDay.update({
      where: { id: existing.id },
      data: { days: body.days },
    })
    await auditLog({ entity: 'LeaveDay', entityId: updated.id, action: 'UPDATE', before: existing, after: updated })
    return c.json({ ...updated, workDate: toIsoDate(updated.workDate) })
  }

  const created = await prisma.leaveDay.create({
    data: { timesheetId: timesheet.id, workDate, days: body.days },
  })
  await auditLog({ entity: 'LeaveDay', entityId: created.id, action: 'CREATE', after: created })
  return c.json({ ...created, workDate: toIsoDate(created.workDate) }, 201)
})

// Build the list of weekday workDates inside the slice covered by `periodKey`.
function weekdayDatesInSlice(periodKey: string): Date[] {
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const sliceCode = weekCode ?? monthCode
  const { startDate: weekStart, endDate: weekEnd } = getPeriodDates(sliceCode)
  const { startDate: monthStart, endDate: monthEnd } = getPeriodDates(monthCode)
  const start = weekCode && monthStart > weekStart ? monthStart : weekStart
  const end = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd
  const out: Date[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  while (cursor <= stop) {
    const dow = cursor.getUTCDay()
    if (dow >= 1 && dow <= 5) out.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

// POST /api/timesheets/:id/submit — DRAFT → SUBMITTED
timesheetMutationsRouter.post('/:id/submit', async (c) => {
  const id = c.req.param('id')
  const actor = await getCurrentUser()

  const timesheet = await prisma.timesheet.findUnique({
    where: { id },
    include: { taskTimesheets: true, leaveDays: true },
  })
  if (!timesheet) return c.json({ error: 'Not found' }, 404)
  if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
    return c.json({ error: `Cannot submit from status ${timesheet.status}` }, 400)
  }

  const window = await requireGlobalTimesheetWindow()
  const sliceStatus = deriveTimesheetWindowStatus(timesheet.periodKey, window.openPeriodKey)
  if (sliceStatus === 'FROZEN' || sliceStatus === 'FUTURE') {
    return c.json({ error: 'Frozen and future timesheets cannot be submitted' }, 400)
  }

  // Fullness: every Mon-Fri in the slice must have task hours + leave = 1 day.
  const expectedDays = weekdayDatesInSlice(timesheet.periodKey)
  const totalsByIso = new Map<string, number>()
  for (const t of timesheet.taskTimesheets) {
    const iso = t.workDate.toISOString().slice(0, 10)
    totalsByIso.set(iso, (totalsByIso.get(iso) ?? 0) + t.days)
  }
  for (const l of timesheet.leaveDays) {
    const iso = l.workDate.toISOString().slice(0, 10)
    totalsByIso.set(iso, (totalsByIso.get(iso) ?? 0) + l.days)
  }
  const offenders = expectedDays
    .map((d) => {
      const iso = d.toISOString().slice(0, 10)
      const total = totalsByIso.get(iso) ?? 0
      return { iso, total }
    })
    .filter(({ total }) => Math.abs(total - 1) > 1e-6)
  if (offenders.length > 0) {
    return c.json(
      {
        error: 'Timesheet is not full — every weekday must total 8h (incl. leave)',
        offenders,
      },
      400,
    )
  }

  const updated = await prisma.timesheet.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      submittedById: actor?.id ?? null,
      // Clear rejection trail on resubmit
      rejectedAt: null,
      rejectedById: null,
      rejectionReason: null,
    },
  })
  await auditLog({ entity: 'Timesheet', entityId: id, action: 'UPDATE', before: timesheet, after: updated, metadata: { transition: 'SUBMIT' } })
  return c.json(timesheetShape(updated))
})

// POST /api/timesheets/:id/approve — SUBMITTED → APPROVED (freezes rates per entry)
timesheetMutationsRouter.post('/:id/approve', async (c) => {
  const id = c.req.param('id')
  const actor = await getCurrentUser()

  const result = await prisma.$transaction(async (tx) => {
    const timesheet = await tx.timesheet.findUnique({
      where: { id },
      include: { taskTimesheets: { include: { assignmentSlot: true } } },
    })
    if (!timesheet) throw Object.assign(new Error('Not found'), { status: 404 })
    if (timesheet.status !== 'SUBMITTED') {
      throw Object.assign(new Error(`Cannot approve from status ${timesheet.status}`), { status: 400 })
    }

    // Snapshot cost+sell rates onto each TaskTimesheet so historical accounting
    // survives later rate changes.
    for (const entry of timesheet.taskTimesheets) {
      const [costRateRecord, sellRateRecord] = await Promise.all([
        tx.employeeCostRate.findFirst({
          where: { employeeId: timesheet.employeeId, validFrom: { lte: entry.workDate } },
          orderBy: { validFrom: 'desc' },
        }),
        tx.quoteLine.findFirst({
          where: {
            quote: { projectId: entry.assignmentSlot.projectId, status: 'VALIDATED' },
            taskId: entry.assignmentSlot.taskId,
            profileId: entry.assignmentSlot.profileId,
          },
        }),
      ])

      const costRate = costRateRecord?.costRatePerDay ?? 0
      const sellRate = sellRateRecord?.sellRatePerDay ?? 0

      await tx.taskTimesheet.update({
        where: { id: entry.id },
        data: {
          appliedCostRatePerDay: costRate,
          appliedCostAmount: entry.days * costRate,
          appliedSellRatePerDay: sellRate,
          appliedSellAmount: entry.days * sellRate,
        },
      })
    }

    return tx.timesheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: actor?.id ?? null,
      },
    })
  })

  await auditLog({ entity: 'Timesheet', entityId: id, action: 'UPDATE', after: result, metadata: { transition: 'APPROVE' } })
  return c.json(timesheetShape(result))
})

// POST /api/timesheets/:id/reject — SUBMITTED → REJECTED
timesheetMutationsRouter.post('/:id/reject', async (c) => {
  const id = c.req.param('id')
  const actor = await getCurrentUser()
  const raw = await c.req.json().catch(() => ({}))
  const parsed = timesheetRejectSchema.safeParse(raw)
  const reason = parsed.success ? parsed.data.reason ?? null : null

  const timesheet = await prisma.timesheet.findUnique({ where: { id } })
  if (!timesheet) return c.json({ error: 'Not found' }, 404)
  if (timesheet.status !== 'SUBMITTED') {
    return c.json({ error: `Cannot reject from status ${timesheet.status}` }, 400)
  }

  const updated = await prisma.timesheet.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectedById: actor?.id ?? null,
      rejectionReason: reason,
    },
  })
  await auditLog({ entity: 'Timesheet', entityId: id, action: 'UPDATE', before: timesheet, after: updated, metadata: { transition: 'REJECT' } })
  return c.json(timesheetShape(updated))
})
