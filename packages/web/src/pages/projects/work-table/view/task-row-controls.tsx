import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUpdateTask, useDeleteTask } from '@/api/hooks'
import type { GridRow } from '@/lib/work-table/types'

interface TaskRowControlsProps {
  projectId: string
  row: GridRow
  onAddTask?: () => void
}

export function TaskRowControls({ projectId, row, onAddTask }: TaskRowControlsProps) {
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  const [renaming, setRenaming] = useState(false)
  const [nameVal, setNameVal] = useState(row.label)
  const renameRef = useRef<HTMLInputElement>(null)

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
        className="ml-1 w-32 rounded border border-sky-400 bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <div className="flex items-center">
      {row.kind === 'phase' && onAddTask && (
        <button
          title="Ajouter une tâche"
          onClick={(e) => { e.stopPropagation(); onAddTask() }}
          className="ml-2 inline-flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
        >
          <Plus size={14} />
        </button>
      )}
      <div className="absolute right-1 flex items-center gap-0.5 rounded-md border bg-card px-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
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
    </div>
  )
}
