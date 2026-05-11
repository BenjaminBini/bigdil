import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { VStack } from '@/components/shared/VStack'
import type { Phase, Task } from '@/api/types'
import { TaskNodeRow } from './task-node-row'

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
  phase: Phase
  onAddTask: (phase: Phase) => void
  onEditPhase: (phase: Phase) => void
  onDeletePhase: (phase: Phase) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

function PhaseBlock({ phase, onAddTask, onEditPhase, onDeletePhase, onEditTask, onDeleteTask }: PhaseBlockProps) {
  const [expanded, setExpanded] = useState(true)
  const tasks = [...phase.tasks].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Card variant="flush">
      <TaskNodeRow
        name={phase.name}
        isPhase
        isExpanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        onAddSubTask={() => onAddTask(phase)}
        onEdit={() => onEditPhase(phase)}
        onDelete={() => onDeletePhase(phase)}
      />

      {expanded && tasks.length > 0 && (
        <TaskChildrenBlock>
          {tasks.map((task, index) => (
            <TreeChildRow key={task.id} hasDivider={index < tasks.length - 1}>
              <TreeConnectorGutter>
                <TreeVerticalLine />
                {index === tasks.length - 1 && <TreeHorizontalLine />}
              </TreeConnectorGutter>
              <TreeChildContent>
                <TaskNodeRow
                  name={task.name}
                  status={task.status}
                  isPhase={false}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task)}
                />
              </TreeChildContent>
            </TreeChildRow>
          ))}
        </TaskChildrenBlock>
      )}
    </Card>
  )
}

interface WbsTreeProps {
  phases: Phase[]
  onAddTask: (phase: Phase) => void
  onEditPhase: (phase: Phase) => void
  onDeletePhase: (phase: Phase) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

export function WbsTaskTree({ phases, onAddTask, onEditPhase, onDeletePhase, onEditTask, onDeleteTask }: WbsTreeProps) {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder)
  return (
    <VStack gap="md">
      {sorted.map((phase) => (
        <PhaseBlock
          key={phase.id}
          phase={phase}
          onAddTask={onAddTask}
          onEditPhase={onEditPhase}
          onDeletePhase={onDeletePhase}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </VStack>
  )
}
