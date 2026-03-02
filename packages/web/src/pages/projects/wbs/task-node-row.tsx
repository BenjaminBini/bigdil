import { Archive, ChevronDown, ChevronRight, GripVertical, Pencil, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Task } from '@/api/types'
import { TaskStatusBadge } from './status-badge'

interface TaskNodeRowProps {
  task: Task
  isPhase: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
}

export function TaskNodeRow({
  task,
  isPhase,
  isExpanded,
  onToggle,
  onAddSubTask,
  onEdit,
}: TaskNodeRowProps) {
  return (
    <div className="group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50">
      <GripVertical className="size-4 shrink-0 cursor-grab text-gray-300" />

      {isPhase ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      ) : (
        <span className="size-5 shrink-0" />
      )}

      <span className={cn('flex-1 text-sm', isPhase ? 'font-semibold text-gray-800' : 'text-gray-700')}>{task.name}</span>
      <TaskStatusBadge status={task.status} />

      <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {isPhase && (
          <Button variant="ghost" size="icon-sm" onClick={() => onAddSubTask(task)} aria-label="Add sub-task" title="Add Sub-task">
            <Plus className="size-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label="Edit task" title="Edit">
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost-destructive" size="icon-sm" aria-label="Archive task" title="Archive">
          <Archive className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
