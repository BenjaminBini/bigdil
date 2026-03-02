import type { TaskStatus } from '@/api/types'
import { Badge } from '@/components/ui/badge'

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
  done: { label: 'Done', className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = TASK_STATUS_CONFIG[status]
  return <Badge className={className}>{label}</Badge>
}
