import type { UserRole } from '@/api/types'
import { Badge } from '@/components/ui/badge'

const ROLE_STYLE: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  PM: 'bg-blue-100 text-blue-800',
  CONSULTANT: 'bg-green-100 text-green-800',
  FINANCE: 'bg-amber-100 text-amber-800',
  EXEC: 'bg-gray-100 text-gray-700',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge className={ROLE_STYLE[role]}>{role}</Badge>
}
