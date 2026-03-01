import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/api/types'

const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  active: { label: 'Active', className: 'bg-green-50 text-green-700 border border-green-200' },
  done: { label: 'Done', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = taskStatusConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}
