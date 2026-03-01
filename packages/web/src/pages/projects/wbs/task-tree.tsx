import { useState } from 'react'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Task } from '@/api/types'
import { StatusBadge } from './status-badge'

interface TaskNodeProps {
  task: Task
  isPhase: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
}

function TaskNodeRow({ task, isPhase, isExpanded, onToggle, onAddSubTask, onEdit }: TaskNodeProps) {
  return (
    <div className="group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md">
      <GripVertical className="size-4 text-gray-300 shrink-0 cursor-grab" />

      {isPhase ? (
        <button
          onClick={onToggle}
          className="flex items-center justify-center size-5 rounded hover:bg-gray-200 text-gray-500 shrink-0"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded
            ? <ChevronDown className="size-4" />
            : <ChevronRight className="size-4" />}
        </button>
      ) : (
        <span className="size-5 shrink-0" />
      )}

      <span className={cn('flex-1 text-sm', isPhase ? 'font-semibold text-gray-800' : 'text-gray-700')}>
        {task.name}
      </span>
      <StatusBadge status={task.status} />

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        {isPhase && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onAddSubTask(task)}
            aria-label="Add sub-task"
            title="Add Sub-task"
          >
            <Plus className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          title="Edit"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Archive task"
          title="Archive"
          className="text-gray-400 hover:text-red-500"
        >
          <Archive className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

interface PhaseBlockProps {
  phase: Task
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
}

function PhaseBlock({ phase, onAddSubTask, onEdit }: PhaseBlockProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
      <TaskNodeRow
        task={phase}
        isPhase
        isExpanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        onAddSubTask={onAddSubTask}
        onEdit={onEdit}
      />

      {expanded && phase.children && phase.children.length > 0 && (
        <div className="border-t border-gray-100">
          {phase.children.map((child, idx) => (
            <div
              key={child.id}
              className={cn(
                'flex items-stretch',
                idx < (phase.children?.length ?? 0) - 1 && 'border-b border-gray-100',
              )}
            >
              <div className="flex flex-col items-center w-8 ml-8 shrink-0 select-none" aria-hidden>
                <div className="w-px bg-gray-200 flex-1" />
                {idx === (phase.children?.length ?? 0) - 1 && (
                  <div className="w-3 h-px bg-gray-200" />
                )}
              </div>

              <div className="flex-1 py-0.5 pr-1">
                <TaskNodeRow
                  task={child}
                  isPhase={false}
                  onAddSubTask={onAddSubTask}
                  onEdit={onEdit}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StandaloneTask({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
      <TaskNodeRow task={task} isPhase={false} onAddSubTask={() => {}} onEdit={onEdit} />
    </div>
  )
}

interface WbsTreeProps {
  tasks: Task[]
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
}

export function WbsTaskTree({ tasks, onAddSubTask, onEdit }: WbsTreeProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) =>
        task.children && task.children.length > 0 ? (
          <PhaseBlock key={task.id} phase={task} onAddSubTask={onAddSubTask} onEdit={onEdit} />
        ) : task.parentTaskId === null ? (
          <div key={task.id} className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
            <TaskNodeRow
              task={task}
              isPhase
              isExpanded={false}
              onToggle={() => {}}
              onAddSubTask={onAddSubTask}
              onEdit={onEdit}
            />
          </div>
        ) : (
          <StandaloneTask key={task.id} task={task} onEdit={onEdit} />
        ),
      )}
    </div>
  )
}
