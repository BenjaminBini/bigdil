import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { workTablePatchSchema } from './schemas.js'

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
