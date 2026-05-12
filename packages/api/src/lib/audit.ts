import type { AuditAction } from '@bigdil/db'
import { prisma } from '@bigdil/db'
import { getCurrentUser } from './current-user.js'

interface AuditOptions {
  entity: string
  entityId: string
  action: AuditAction
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}

// Append a row to the audit log. Best-effort: failures are logged but never
// bubble up to the caller (we don't want an audit-table problem to fail the
// underlying write). Wrap your mutating code with `auditLog({...})` after the
// write completes.
export async function auditLog(opts: AuditOptions): Promise<void> {
  try {
    const actor = await getCurrentUser()
    await prisma.auditLog.create({
      data: {
        entity: opts.entity,
        entityId: opts.entityId,
        action: opts.action,
        actorId: actor?.id ?? null,
        before: (opts.before ?? undefined) as never,
        after: (opts.after ?? undefined) as never,
        metadata: (opts.metadata ?? undefined) as never,
      },
    })
  } catch (err) {
    console.error('[audit] failed to write audit log entry', err)
  }
}
