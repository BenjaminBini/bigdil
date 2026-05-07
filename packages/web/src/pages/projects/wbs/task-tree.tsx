import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { VStack } from '@/components/shared/VStack'
import type { Task } from '@/api/types'
import { TaskNodeRow } from './task-node-row'

// Page-local tree connector lines for the WBS hierarchy visualization
function TreeVerticalLine() {
  return <div className="flex-1 w-px bg-gray-200" />
}

function TreeHorizontalLine() {
  return <div className="h-px w-3 bg-gray-200" />
}

function TaskChildrenBlock({ children }: { children: ReactNode }) {
  return <div className="border-t border-gray-100">{children}</div>
}

function TreeChildRow({ hasDivider, children }: { hasDivider: boolean; children: ReactNode }) {
  return (
    <div className={hasDivider ? 'flex items-stretch border-b border-gray-100' : 'flex items-stretch'}>
      {children}
    </div>
  )
}

function TreeConnectorGutter({ children }: { children: ReactNode }) {
  return (
    <div className="ml-8 flex w-8 shrink-0 select-none flex-col items-center" aria-hidden>
      {children}
    </div>
  )
}

function TreeChildContent({ children }: { children: ReactNode }) {
  return <div className="flex-1 py-0.5 pr-1">{children}</div>
}

interface PhaseBlockProps {
  phase: Task
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function PhaseBlock({ phase, onAddSubTask, onEdit, onDelete }: PhaseBlockProps) {
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
        onDelete={onDelete}
      />

      {expanded && phase.children && phase.children.length > 0 && (
        <TaskChildrenBlock>
          {phase.children.map((child, index) => (
            <TreeChildRow key={child.id} hasDivider={index < phase.children!.length - 1}>
              <TreeConnectorGutter>
                <TreeVerticalLine />
                {index === phase.children!.length - 1 && <TreeHorizontalLine />}
              </TreeConnectorGutter>
              <TreeChildContent>
                <TaskNodeRow task={child} isPhase={false} onAddSubTask={onAddSubTask} onEdit={onEdit} onDelete={onDelete} />
              </TreeChildContent>
            </TreeChildRow>
          ))}
        </TaskChildrenBlock>
      )}
    </Card>
  )
}

function StandaloneTask({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (task: Task) => void }) {
  return (
    <Card variant="flush">
      <TaskNodeRow task={task} isPhase={false} onAddSubTask={() => {}} onEdit={onEdit} onDelete={onDelete} />
    </Card>
  )
}

interface WbsTreeProps {
  tasks: Task[]
  onAddSubTask: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function WbsTaskTree({ tasks, onAddSubTask, onEdit, onDelete }: WbsTreeProps) {
  return (
    <VStack gap="md">
      {tasks.map((task) =>
        task.children && task.children.length > 0 ? (
          <PhaseBlock key={task.id} phase={task} onAddSubTask={onAddSubTask} onEdit={onEdit} onDelete={onDelete} />
        ) : task.parentTaskId === null ? (
          <Card key={task.id} variant="flush">
            <TaskNodeRow task={task} isPhase isExpanded={false} onToggle={() => {}} onAddSubTask={onAddSubTask} onEdit={onEdit} onDelete={onDelete} />
          </Card>
        ) : (
          <StandaloneTask key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ),
      )}
    </VStack>
  )
}
