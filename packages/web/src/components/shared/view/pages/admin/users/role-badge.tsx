import type { UserRole } from '@/api/types'
import { cn } from '@/lib/utils'
import { ROLE_BADGE_COLORS } from './data'

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        ROLE_BADGE_COLORS[role],
      )}
    >
      {role}
    </span>
  )
}
