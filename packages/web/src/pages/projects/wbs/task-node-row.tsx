import { Archive, ChevronDown, ChevronRight, GripVertical, Pencil, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import type { Task } from '@/api/types'
import { TaskStatusBadge } from './status-badge'

// Page-local layout components for the WBS task node structure
function TaskNodeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50">
      {children}
    </div>
  )
}

function TaskNodeGrip() {
  return <GripVertical size={16} className="shrink-0 cursor-grab text-gray-300" />
}

function TaskNodeActions({ children }: { children: ReactNode }) {
  return (
    <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      {children}
    </div>
  )
}

function TaskNodeSpacer() {
  return <span className="size-5 shrink-0" />
}

function TaskNodeLabel({ isPhase, children }: { isPhase: boolean; children: ReactNode }) {
  return (
    <span className={cn('flex-1 text-sm', isPhase ? 'font-semibold text-gray-800' : 'text-gray-700')}>
      {children}
    </span>
  )
}

interface TaskNodeRowProps {
  task: Task
  isPhase: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskNodeRow({
  task,
  isPhase,
  isExpanded,
  onToggle,
  onAddSubTask,
  onEdit,
  onDelete,
}: TaskNodeRowProps) {
  return (
    <TaskNodeLayout>
      <TaskNodeGrip />

      {isPhase ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>
      ) : (
        <TaskNodeSpacer />
      )}

      <TaskNodeLabel isPhase={isPhase}>{task.name}</TaskNodeLabel>
      <TaskStatusBadge status={task.status} />

      <TaskNodeActions>
        {isPhase && (
          <Button variant="ghost" size="icon-sm" onClick={() => onAddSubTask(task)} aria-label="Add sub-task" title="Add Sub-task">
            <Plus size={14} />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label="Edit task" title="Edit">
          <Pencil size={14} />
        </Button>
        <Button variant="ghost-destructive" size="icon-sm" onClick={() => onDelete(task)} aria-label="Delete task" title="Supprimer">
          <Archive size={14} />
        </Button>
      </TaskNodeActions>
    </TaskNodeLayout>
  )
}
