import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useCreateTask, useUpdateTask, useDeleteTask, useUpdatePhase, useDeletePhase } from '@/api/hooks'
import type { GridRow } from '@/lib/work-table/types'

interface TaskRowControlsProps {
  projectId: string
  row: GridRow
}

export function TaskRowControls({ projectId, row }: TaskRowControlsProps) {
  const { t } = useTranslation('pages')
  const createTask = useCreateTask(projectId)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const updatePhase = useUpdatePhase(projectId)
  const deletePhase = useDeletePhase(projectId)

  const [renaming, setRenaming] = useState(false)
  const [nameVal, setNameVal] = useState(row.label)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)
  const newTaskRef = useRef<HTMLInputElement>(null)

  function commitRename() {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== row.label) {
      if (row.kind === 'phase') {
        updatePhase.mutate({ phaseId: row.phaseId, name: trimmed }, {
          onError: () => toast.error('Échec du renommage'),
        })
      } else if (row.taskId) {
        updateTask.mutate({ taskId: row.taskId, name: trimmed }, {
          onError: () => toast.error('Échec du renommage'),
        })
      }
    } else {
      setNameVal(row.label)
    }
    setRenaming(false)
  }

  function commitAddTask() {
    const trimmed = newTaskName.trim()
    if (trimmed) {
      createTask.mutate({ phaseId: row.phaseId, name: trimmed }, {
        onSuccess: () => toast.success(`Tâche "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setNewTaskName('')
    setAddingTask(false)
  }

  function handleDelete() {
    const label = row.label
    if (row.kind === 'phase') {
      deletePhase.mutate(row.phaseId, {
        onSuccess: () => toast.success(`"${label}" supprimé`),
        onError: () => toast.error('Échec de la suppression'),
      })
    } else if (row.taskId) {
      deleteTask.mutate(row.taskId, {
        onSuccess: () => toast.success(`"${label}" supprimé`),
        onError: () => toast.error('Échec de la suppression'),
      })
    }
  }

  if (renaming) {
    return (
      <input
        ref={renameRef}
        autoFocus
        value={nameVal}
        onChange={(e) => setNameVal(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') renameRef.current?.blur()
          if (e.key === 'Escape') { setNameVal(row.label); setRenaming(false) }
        }}
        onClick={(e) => e.stopPropagation()}
        className="ml-1 w-32 rounded border border-sky-400 bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <>
      {addingTask && (
        <input
          ref={newTaskRef}
          autoFocus
          placeholder={t('workTable.placeholders.taskName')}
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onBlur={commitAddTask}
          onKeyDown={(e) => {
            if (e.key === 'Enter') newTaskRef.current?.blur()
            if (e.key === 'Escape') { setNewTaskName(''); setAddingTask(false) }
          }}
          onClick={(e) => e.stopPropagation()}
          className="ml-1 w-32 rounded border border-sky-400 bg-background px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-sky-400"
        />
      )}

      <div className="absolute right-1 flex items-center gap-0.5 rounded-md border bg-card px-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
        {row.kind === 'phase' && !addingTask && (
          <Button
            variant="ghost"
            size="icon-sm"
            title={t('workTable.tooltips.addTask')}
            onClick={(e) => { e.stopPropagation(); setAddingTask(true) }}
          >
            <Plus size={12} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          title={t('workTable.tooltips.rename')}
          onClick={(e) => { e.stopPropagation(); setRenaming(true) }}
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost-destructive"
          size="icon-sm"
          title={t('workTable.tooltips.delete')}
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </>
  )
}
