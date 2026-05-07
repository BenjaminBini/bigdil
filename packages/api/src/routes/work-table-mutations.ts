import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { workTablePatchSchema, workTableAssignSchema } from './schemas.js'

export const workTableMutationsRouter = new Hono()

// PATCH /api/projects/:id/work-table — upsert a planned_days cell
workTableMutationsRouter.patch('/:id/work-table', async (c) => {
  const projectId = c.req.param('id')
  const raw = await c.req.json()
  const result = workTablePatchSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const { taskId, profileId, employeeId, periodId, days } = result.data

  // Find existing row — use compound unique key when employeeId is set,
  // fall back to findFirst for NULL (NULLs are distinct in PG unique indexes)
  const resolvedEmployeeId = employeeId ?? null
  const existing = resolvedEmployeeId
    ? await prisma.plannedDay.findUnique({
        where: {
          projectId_periodId_taskId_profileId_employeeId: {
            projectId,
            periodId,
            taskId,
            profileId,
            employeeId: resolvedEmployeeId,
          },
        },
      })
    : await prisma.plannedDay.findFirst({
        where: { projectId, periodId, taskId, profileId, employeeId: null },
      })

  if (days === 0 && existing) {
    // Delete the row if days is 0
    await prisma.plannedDay.delete({ where: { id: existing.id } })
    return c.json({ deleted: true })
  }

  if (existing) {
    // Update existing row
    const updated = await prisma.plannedDay.update({
      where: { id: existing.id },
      data: { days },
    })
    return c.json(updated)
  }

  // Insert new row
  const id = `pd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const inserted = await prisma.plannedDay.create({
    data: {
      id,
      projectId,
      periodId,
      taskId,
      profileId,
      employeeId: employeeId ?? null,
      days,
    },
  })

  return c.json(inserted, 201)
})

// POST /api/projects/:id/work-table/assign — transfer UNASSIGNED days to a named employee
workTableMutationsRouter.post('/:id/work-table/assign', async (c) => {
  const projectId = c.req.param('id')
  const raw = await c.req.json()
  const result = workTableAssignSchema.safeParse(raw)
  if (!result.success) return c.json({ error: result.error.issues }, 400)
  const { taskId, profileId, employeeId } = result.data

  const unassigned = await prisma.plannedDay.findMany({
    where: { projectId, taskId, profileId, employeeId: null },
  })

  if (unassigned.length > 0) {
    // Transfer existing UNASSIGNED days to the employee
    await prisma.$transaction(async (tx) => {
      for (const row of unassigned) {
        const existing = await tx.plannedDay.findUnique({
          where: {
            projectId_periodId_taskId_profileId_employeeId: {
              projectId, periodId: row.periodId, taskId, profileId, employeeId,
            },
          },
        })

        if (existing) {
          await tx.plannedDay.update({
            where: { id: existing.id },
            data: { days: existing.days + row.days },
          })
        } else {
          const id = `pd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
          await tx.plannedDay.create({
            data: { id, projectId, periodId: row.periodId, taskId, profileId, employeeId, days: row.days },
          })
        }

        await tx.plannedDay.delete({ where: { id: row.id } })
      }
    })
    return c.json({ moved: unassigned.length })
  }

  // No UNASSIGNED rows — check if employee already has rows for this slot
  const alreadyAssigned = await prisma.plannedDay.findFirst({
    where: { projectId, taskId, profileId, employeeId },
  })
  if (alreadyAssigned) return c.json({ moved: 0, alreadyAssigned: true })

  // Seed a 0-day row for each non-frozen period so the employee row appears in the grid
  const periods = await prisma.period.findMany({
    where: { projectId, status: { in: ['OPEN', 'FUTURE'] } },
    orderBy: { periodNumber: 'asc' },
    take: 1,
  })
  if (periods.length === 0) return c.json({ moved: 0 })

  const id = `pd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await prisma.plannedDay.create({
    data: { id, projectId, periodId: periods[0].id, taskId, profileId, employeeId, days: 0 },
  })

  return c.json({ moved: 0, seeded: true })
})
