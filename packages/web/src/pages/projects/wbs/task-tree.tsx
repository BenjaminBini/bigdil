import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { Task } from '@/api/types'
import { TaskNodeRow } from './task-node-row'

interface PhaseBlockProps {
  phase: Task
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
}

function PhaseBlock({ phase, onAddSubTask, onEdit }: PhaseBlockProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card variant="flush">
      <TaskNodeRow
        task={phase}
        isPhase
        isExpanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        onAddSubTask={onAddSubTask}
        onEdit={onEdit}
      />

      {expanded && phase.children && phase.children.length > 0 && (
        <div className="border-t border-gray-100">
          {phase.children.map((child, index) => (
            <div key={child.id} className={cn('flex items-stretch', index < phase.children!.length - 1 && 'border-b border-gray-100')}>
              <div className="ml-8 flex w-8 shrink-0 select-none flex-col items-center" aria-hidden>
                <div className="flex-1 w-px bg-gray-200" />
                {index === phase.children!.length - 1 && <div className="h-px w-3 bg-gray-200" />}
              </div>
              <div className="flex-1 py-0.5 pr-1">
                <TaskNodeRow task={child} isPhase={false} onAddSubTask={onAddSubTask} onEdit={onEdit} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function StandaloneTask({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  return (
    <Card variant="flush">
      <TaskNodeRow task={task} isPhase={false} onAddSubTask={() => {}} onEdit={onEdit} />
    </Card>
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
          <Card key={task.id} variant="flush">
            <TaskNodeRow task={task} isPhase isExpanded={false} onToggle={() => {}} onAddSubTask={onAddSubTask} onEdit={onEdit} />
          </Card>
        ) : (
          <StandaloneTask key={task.id} task={task} onEdit={onEdit} />
        ),
      )}
    </div>
  )
}
