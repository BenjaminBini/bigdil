import { StatusBadge } from '@/components/shared/status-badge'

export function ActiveBadge({ active }: { active: boolean }) {
  return <StatusBadge status={active ? 'ACTIVE' : 'INACTIVE'} />
}
