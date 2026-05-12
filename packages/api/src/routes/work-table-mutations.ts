import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { workTablePatchSchema, workTableAssignSchema } from './schemas.js'
import { comparePeriodSliceKeys, deriveTimesheetWindowStatus, getPeriodSlicesForDateRange, parsePeriodSliceKey } from '../lib/period-utils.js'
import { requireGlobalTimesheetWindow } from '../lib/timesheet-window.js'
import { auditLog } from '../lib/audit.js'
import { toIsoDate } from '../lib/dates.js'
import { ensureTaskTimesheetForSlot, pruneTaskTimesheetIfUntouched } from '../lib/timesheet-provisioning.js'

export const workTableMutationsRouter = new Hono()

async function requireEditableWeeklyPeriodKey(periodCode: string) {
  const { weekCode, periodKey } = parsePeriodSliceKey(periodCode)
  if (!weekCode) {
    return { error: 'Planned days must target a weekly slice' as const }
  }
  const window = await requireGlobalTimesheetWindow()
  const status = deriveTimesheetWindowStatus(periodKey, window.openPeriodKey)
  if (status !== 'FUTURE' && status !== 'OPEN') {
    return { error: 'Only the open week or future weeks can be edited' as const }
  }
  return { periodKey }
}

// First future weekly slice within the project's date range, per the global window.
async function getSeedPeriodKey(projectId: string): Promise<string | null> {
  const [project, window] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { startDate: true, endDate: true },
    }),
    requireGlobalTimesheetWindow(),
  ])

  if (!project?.startDate || !project.endDate) return null

  const slices = getPeriodSlicesForDateRange(toIsoDate(project.startDate), toIsoDate(project.endDate), 'WEEKLY')
    .filter((slice) => deriveTimesheetWindowStatus(slice.periodKey, window.openPeriodKey) === 'FUTURE')
    .sort((a, b) => comparePeriodSliceKeys(a.periodKey, b.periodKey))

  return slices[0]?.periodKey ?? null
}

async function findOrCreateSlot(input: {
  projectId: string
  taskId: string
  profileId: string
  employeeId: string | null
}) {
  // Prisma's compound-unique types don't accept null; fall back to findFirst when
  // the slot is the unassigned one, then create if missing.
  const existing = input.employeeId
    ? await prisma.assignmentSlot.findUnique({
        where: {
          projectId_taskId_profileId_employeeId: {
            projectId: input.projectId,
            taskId: input.taskId,
            profileId: input.profileId,
            employeeId: input.employeeId,
          },
        },
      })
    : await prisma.assignmentSlot.findFirst({
        where: {
          projectId: input.projectId,
          taskId: input.taskId,
          profileId: input.profileId,
          employeeId: null,
        },
      })
  if (existing) return existing
  return prisma.assignmentSlot.create({ data: input })
}

// PATCH /api/projects/:id/work-table — upsert a planned_days cell
workTableMutationsRouter.patch('/:id/work-table', async (c) => {
  const projectId = c.req.param('id')
  const raw = await c.req.json()
  const result = workTablePatchSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const { taskId, profileId, employeeId, periodCode, days } = result.data

  const slice = await requireEditableWeeklyPeriodKey(periodCode)
  if ('error' in slice) return c.json({ error: slice.error }, 400)
  const { periodKey } = slice

  const slot = await findOrCreateSlot({
    projectId,
    taskId,
    profileId,
    employeeId: employeeId ?? null,
  })

  const existing = await prisma.plannedDay.findUnique({
    where: { assignmentSlotId_periodKey: { assignmentSlotId: slot.id, periodKey } },
  })

  // Keep the open Timesheet aligned with the work-table for assigned slots:
  // a PlannedDay landing in the open week creates a 0-day TaskTimesheet stub,
  // and removing the PlannedDay prunes the stub if it's still untouched.
  const window = await requireGlobalTimesheetWindow()
  const isOpenPeriod = periodKey === window.openPeriodKey
  const targetEmployeeId = slot.employeeId

  if (days === 0 && existing) {
    await prisma.plannedDay.delete({ where: { id: existing.id } })
    await auditLog({ entity: 'PlannedDay', entityId: existing.id, action: 'DELETE', before: existing })
    if (isOpenPeriod && targetEmployeeId) {
      await pruneTaskTimesheetIfUntouched({
        employeeId: targetEmployeeId,
        assignmentSlotId: slot.id,
        periodKey,
      })
    }
    return c.json({ deleted: true })
  }

  if (existing) {
    const updated = await prisma.plannedDay.update({ where: { id: existing.id }, data: { days } })
    await auditLog({ entity: 'PlannedDay', entityId: existing.id, action: 'UPDATE', before: existing, after: updated })
    if (isOpenPeriod && targetEmployeeId) {
      await ensureTaskTimesheetForSlot({
        employeeId: targetEmployeeId,
        assignmentSlotId: slot.id,
        periodKey,
      })
    }
    return c.json(updated)
  }

  const inserted = await prisma.plannedDay.create({
    data: { assignmentSlotId: slot.id, periodKey, days },
  })
  await auditLog({ entity: 'PlannedDay', entityId: inserted.id, action: 'CREATE', after: inserted })
  if (isOpenPeriod && targetEmployeeId) {
    await ensureTaskTimesheetForSlot({
      employeeId: targetEmployeeId,
      assignmentSlotId: slot.id,
      periodKey,
    })
  }
  return c.json(inserted, 201)
})

// POST /api/projects/:id/work-table/assign — transfer UNASSIGNED days to a named employee
workTableMutationsRouter.post('/:id/work-table/assign', async (c) => {
  const projectId = c.req.param('id')
  const raw = await c.req.json()
  const result = workTableAssignSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const { taskId, profileId, employeeId } = result.data

  // Source: the unassigned slot (if any) for this (project, task, profile)
  const unassignedSlot = await prisma.assignmentSlot.findFirst({
    where: { projectId, taskId, profileId, employeeId: null },
    include: { plannedDays: true },
  })

  // Destination: the slot for the named employee (create if missing)
  const targetSlot = await findOrCreateSlot({ projectId, taskId, profileId, employeeId })

  const window = await requireGlobalTimesheetWindow()

  if (unassignedSlot && unassignedSlot.plannedDays.length > 0) {
    const movedPeriodKeys: string[] = []
    await prisma.$transaction(async (tx) => {
      for (const pd of unassignedSlot.plannedDays) {
        movedPeriodKeys.push(pd.periodKey)
        const existing = await tx.plannedDay.findUnique({
          where: { assignmentSlotId_periodKey: { assignmentSlotId: targetSlot.id, periodKey: pd.periodKey } },
        })
        if (existing) {
          await tx.plannedDay.update({ where: { id: existing.id }, data: { days: existing.days + pd.days } })
        } else {
          await tx.plannedDay.create({ data: { assignmentSlotId: targetSlot.id, periodKey: pd.periodKey, days: pd.days } })
        }
        await tx.plannedDay.delete({ where: { id: pd.id } })
      }
      // Optionally remove the now-empty unassigned slot
      await tx.assignmentSlot.delete({ where: { id: unassignedSlot.id } })
    })

    // Sync open Timesheet entry for any open-period planned days now sitting
    // on the target slot.
    if (movedPeriodKeys.includes(window.openPeriodKey)) {
      await ensureTaskTimesheetForSlot({
        employeeId,
        assignmentSlotId: targetSlot.id,
        periodKey: window.openPeriodKey,
      })
    }

    return c.json({ moved: unassignedSlot.plannedDays.length })
  }

  // Already assigned and seeded?
  const existingForTarget = await prisma.plannedDay.findFirst({ where: { assignmentSlotId: targetSlot.id } })
  if (existingForTarget) return c.json({ moved: 0, alreadyAssigned: true })

  // Otherwise, seed a single zero-day row at the first future week for visibility.
  const seedPeriodKey = await getSeedPeriodKey(projectId)
  if (!seedPeriodKey) return c.json({ error: 'No assignable period found for this project' }, 400)
  const slice = await requireEditableWeeklyPeriodKey(seedPeriodKey)
  if ('error' in slice) return c.json({ error: slice.error }, 400)

  await prisma.plannedDay.create({
    data: { assignmentSlotId: targetSlot.id, periodKey: slice.periodKey, days: 0 },
  })

  return c.json({ moved: 0, seeded: true, periodCode: seedPeriodKey })
})
