import type { UserRole } from '@/api/types'
import { StatusBadge } from '@/components/shared/status-badge'

export function RoleBadge({ role }: { role: UserRole }) {
  return <StatusBadge status={role} label={role} />
}
