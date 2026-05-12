import { Archive, ChevronDown, ChevronRight, GripVertical, Pencil, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import type { TaskStatus } from '@/api/types'
import { TaskStatusBadge } from './status-badge'

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
  name: string
  status?: TaskStatus
  isPhase: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onAddSubTask?: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskNodeRow({
  name,
  status,
  isPhase,
  isExpanded,
  onToggle,
  onAddSubTask,
  onEdit,
  onDelete,
}: TaskNodeRowProps) {
  const { t } = useTranslation(['common', 'pages'])
  return (
    <TaskNodeLayout>
      <TaskNodeGrip />

      {isPhase ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={isExpanded ? t('common:sidebar.collapse') : t('common:sidebar.expand')}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>
      ) : (
        <TaskNodeSpacer />
      )}

      <TaskNodeLabel isPhase={isPhase}>{name}</TaskNodeLabel>
      {status && <TaskStatusBadge status={status} />}

      <TaskNodeActions>
        {isPhase && onAddSubTask && (
          <Button variant="ghost" size="icon-sm" onClick={onAddSubTask} aria-label={t('pages:workTable.tooltips.addSubTask')} title={t('pages:workTable.tooltips.addSubTask')}>
            <Plus size={14} />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={t('pages:workTable.tooltips.edit')} title={t('pages:workTable.tooltips.edit')}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost-destructive" size="icon-sm" onClick={onDelete} aria-label={t('pages:workTable.tooltips.delete')} title={t('pages:workTable.tooltips.delete')}>
          <Archive size={14} />
        </Button>
      </TaskNodeActions>
    </TaskNodeLayout>
  )
}
