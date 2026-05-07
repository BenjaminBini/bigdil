import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/api/hooks'
import type { GridRow } from '@/lib/work-table/types'

interface TaskRowControlsProps {
  projectId: string
  row: GridRow
}

export function TaskRowControls({ projectId, row }: TaskRowControlsProps) {
  const createTask = useCreateTask(projectId)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  const [renaming, setRenaming] = useState(false)
  const [nameVal, setNameVal] = useState(row.label)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)
  const newTaskRef = useRef<HTMLInputElement>(null)

  function commitRename() {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== row.label && (row.taskId || row.kind === 'phase')) {
      const id = row.kind === 'phase' ? row.phaseId : row.taskId!
      updateTask.mutate({ taskId: id, name: trimmed }, {
        onError: () => toast.error('Échec du renommage'),
      })
    } else {
      setNameVal(row.label)
    }
    setRenaming(false)
  }

  function commitAddTask() {
    const trimmed = newTaskName.trim()
    if (trimmed) {
      createTask.mutate({ name: trimmed, parentTaskId: row.phaseId }, {
        onSuccess: () => toast.success(`Tâche "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setNewTaskName('')
    setAddingTask(false)
  }

  function handleDelete() {
    const id = row.kind === 'phase' ? row.phaseId : row.taskId!
    const label = row.label
    deleteTask.mutate(id, {
      onSuccess: () => toast.success(`"${label}" supprimé`),
      onError: () => toast.error('Échec de la suppression'),
    })
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
        className="ml-1 w-32 rounded border border-sky-400 bg-white px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <>
      {addingTask && (
        <input
          ref={newTaskRef}
          autoFocus
          placeholder="Nom de la tâche…"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onBlur={commitAddTask}
          onKeyDown={(e) => {
            if (e.key === 'Enter') newTaskRef.current?.blur()
            if (e.key === 'Escape') { setNewTaskName(''); setAddingTask(false) }
          }}
          onClick={(e) => e.stopPropagation()}
          className="ml-1 w-32 rounded border border-sky-400 bg-white px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-sky-400"
        />
      )}

      <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {row.kind === 'phase' && !addingTask && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Ajouter une tâche"
            onClick={(e) => { e.stopPropagation(); setAddingTask(true) }}
          >
            <Plus size={12} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          title="Renommer"
          onClick={(e) => { e.stopPropagation(); setRenaming(true) }}
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost-destructive"
          size="icon-sm"
          title="Supprimer"
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </>
  )
}
