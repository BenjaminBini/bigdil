import { Hono } from 'hono'
import { prisma } from '@bigdil/db'
import { auditLog } from '../lib/audit.js'

export const usersRouter = new Hono()

interface UserWriteBody {
  name?: string
  email?: string
  role?: 'ADMIN' | 'PM' | 'CONSULTANT' | 'FINANCE' | 'EXEC'
  employeeId?: string | null
}

const VALID_ROLES = ['ADMIN', 'PM', 'CONSULTANT', 'FINANCE', 'EXEC'] as const
type ValidRole = (typeof VALID_ROLES)[number]

function isValidRole(role: string | undefined): role is ValidRole {
  return !!role && (VALID_ROLES as readonly string[]).includes(role)
}

function trimOrUndefined(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

// GET /api/users — list all users
usersRouter.get('/', async (c) => {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } })
  return c.json(users)
})

// POST /api/users — create user
usersRouter.post('/', async (c) => {
  const body = await c.req.json<UserWriteBody>()

  const name = trimOrUndefined(body.name)
  const email = trimOrUndefined(body.email)?.toLowerCase()
  const role = body.role
  const employeeId = body.employeeId === undefined || body.employeeId === null ? null : body.employeeId.trim() || null

  if (!name) return c.json({ error: 'name is required' }, 400)
  if (!email) return c.json({ error: 'email is required' }, 400)
  if (!isValidRole(role)) return c.json({ error: 'role is required and must be a valid UserRole' }, 400)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ error: 'A user with this email already exists' }, 409)

  if (employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) return c.json({ error: 'Linked employee not found' }, 400)
    const linkedUser = await prisma.user.findUnique({ where: { employeeId } })
    if (linkedUser) return c.json({ error: 'This employee is already linked to another user' }, 409)
  }

  const user = await prisma.user.create({
    data: { name, email, role, employeeId },
  })
  await auditLog({ entity: 'User', entityId: user.id, action: 'CREATE', after: user })

  return c.json(user, 201)
})

// PATCH /api/users/:id — update user
usersRouter.patch('/:id', async (c) => {
  const userId = c.req.param('id')
  const body = await c.req.json<UserWriteBody>()

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return c.json({ error: 'User not found' }, 404)

  const data: { name?: string; email?: string; role?: ValidRole; employeeId?: string | null } = {}

  const name = trimOrUndefined(body.name)
  if (name !== undefined) data.name = name

  const email = trimOrUndefined(body.email)?.toLowerCase()
  if (email !== undefined && email !== existing.email) {
    const conflict = await prisma.user.findUnique({ where: { email } })
    if (conflict) return c.json({ error: 'A user with this email already exists' }, 409)
    data.email = email
  }

  if (body.role !== undefined) {
    if (!isValidRole(body.role)) return c.json({ error: 'role must be a valid UserRole' }, 400)
    data.role = body.role
  }

  if (body.employeeId !== undefined) {
    const nextLink = body.employeeId === null ? null : body.employeeId.trim() || null
    if (nextLink && nextLink !== existing.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: nextLink } })
      if (!employee) return c.json({ error: 'Linked employee not found' }, 400)
      const linkedUser = await prisma.user.findUnique({ where: { employeeId: nextLink } })
      if (linkedUser && linkedUser.id !== userId) {
        return c.json({ error: 'This employee is already linked to another user' }, 409)
      }
    }
    data.employeeId = nextLink
  }

  const user = await prisma.user.update({ where: { id: userId }, data })
  await auditLog({ entity: 'User', entityId: user.id, action: 'UPDATE', before: existing, after: user })

  return c.json(user)
})
