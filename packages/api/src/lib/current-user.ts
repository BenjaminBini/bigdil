import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { prisma } from '@bigdil/db'

export const IMPERSONATE_COOKIE = 'bigdil_impersonate'

// Returns the "real" logged-in user, ignoring impersonation.
// Dev shim: first ADMIN ordered by createdAt. Replace with real session lookup later.
export async function getRealUser() {
  return prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  })
}

// Returns the user that requests should act as. If a valid impersonation
// cookie is present AND the real user is an ADMIN, returns the impersonated
// user. Otherwise returns the real user.
export async function getEffectiveUser(c?: Context) {
  const real = await getRealUser()
  if (!real || !c) return real

  const impersonatedId = getCookie(c, IMPERSONATE_COOKIE)
  if (!impersonatedId) return real
  if (real.role !== 'ADMIN') return real

  const target = await prisma.user.findUnique({ where: { id: impersonatedId } })
  return target ?? real
}

// Backwards-compat: existing audit code calls this with no context.
// It returns the real user (no impersonation override) — auditing should
// always record the real actor, not the impersonated identity.
export async function getCurrentUser() {
  return getRealUser()
}

export async function requireCurrentUser() {
  const user = await getRealUser()
  if (!user) {
    throw Object.assign(new Error('Current user not configured'), { status: 500 })
  }
  return user
}

export async function requireManagerUser() {
  const user = await requireCurrentUser()
  if (user.role !== 'ADMIN' && user.role !== 'PM') {
    throw Object.assign(new Error('Manager access required'), { status: 403 })
  }
  return user
}

export async function requireAdminUser() {
  const user = await requireCurrentUser()
  if (user.role !== 'ADMIN') {
    throw Object.assign(new Error('Admin access required'), { status: 403 })
  }
  return user
}
