import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { prisma } from '@bigdil/db'
import { auditLog } from '../lib/audit.js'
import {
  IMPERSONATE_COOKIE,
  getEffectiveUser,
  getRealUser,
  requireAdminUser,
} from '../lib/current-user.js'

export const authRouter = new Hono()

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 hours
}

// GET /api/auth/me — effective user (impersonation applied) + impersonation status
authRouter.get('/me', async (c) => {
  const realUser = await getRealUser()
  const effective = await getEffectiveUser(c)

  if (!realUser || !effective) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  return c.json({
    user: effective,
    realUser,
    isImpersonating: realUser.id !== effective.id,
  })
})

// POST /api/auth/impersonate — admin starts impersonating another user
authRouter.post('/impersonate', async (c) => {
  const actor = await requireAdminUser()
  const body = await c.req.json<{ userId?: string }>()

  const targetId = body.userId?.trim()
  if (!targetId) return c.json({ error: 'userId is required' }, 400)
  if (targetId === actor.id) return c.json({ error: 'Cannot impersonate yourself' }, 400)

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) return c.json({ error: 'Target user not found' }, 404)

  setCookie(c, IMPERSONATE_COOKIE, target.id, COOKIE_OPTS)

  await auditLog({
    entity: 'User',
    entityId: target.id,
    action: 'UPDATE',
    metadata: { impersonateStart: true, actorId: actor.id, targetId: target.id },
  })

  return c.json({ user: target, realUser: actor, isImpersonating: true })
})

// DELETE /api/auth/impersonate — stop impersonating
authRouter.delete('/impersonate', async (c) => {
  const actor = await requireAdminUser()

  await auditLog({
    entity: 'User',
    entityId: actor.id,
    action: 'UPDATE',
    metadata: { impersonateStop: true, actorId: actor.id },
  })

  deleteCookie(c, IMPERSONATE_COOKIE, { path: '/' })
  return c.json({ user: actor, realUser: actor, isImpersonating: false })
})
