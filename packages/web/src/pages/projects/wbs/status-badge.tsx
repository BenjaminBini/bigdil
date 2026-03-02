import type { TaskStatus } from '@/api/types'
import { StatusBadge } from '@/components/shared/status-badge'

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <StatusBadge status={status} />
}
