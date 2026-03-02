import { useState } from 'react'
import { useParams } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useProject } from '@/api/hooks'
import type { Task } from '@/api/types'
import { WbsTaskTree } from './wbs/task-tree'
import { TaskDialog, type TaskFormState } from './wbs/task-dialog'

type DialogMode =
  | { type: 'add-phase' }
  | { type: 'add-sub-task'; parentTask: Task }
  | { type: 'edit'; task: Task }
  | null

const emptyForm: TaskFormState = {
  name: '',
  description: '',
  status: 'planned',
}

export default function WbsPage() {
  const { id: projectId } = useParams()
  const { data, isLoading, error } = useProject(projectId!)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading data</div>

  function openAddPhase() {
    setForm(emptyForm)
    setDialogMode({ type: 'add-phase' })
  }

  function openAddSubTask(parentTask: Task) {
    setForm(emptyForm)
    setDialogMode({ type: 'add-sub-task', parentTask })
  }

  function openEdit(task: Task) {
    setForm({ name: task.name, description: '', status: task.status })
    setDialogMode({ type: 'edit', task })
  }

  function handleClose() {
    setDialogMode(null)
    setForm(emptyForm)
  }

  function handleSave() {
    toast.success('Would save task', {
      description: `"${form.name.trim()}" — status: ${form.status}`,
    })
    handleClose()
  }

  function getDialogTitle(): string {
    if (!dialogMode) return ''
    if (dialogMode.type === 'add-phase') return 'Add Phase'
    if (dialogMode.type === 'add-sub-task') return `Add Sub-task to "${dialogMode.parentTask.name}"`
    return `Edit "${dialogMode.task.name}"`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Work Breakdown Structure
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage the phases and tasks for this project
          </p>
        </div>
      </div>

      <WbsTaskTree
        tasks={data.tasks}
        onAddSubTask={openAddSubTask}
        onEdit={openEdit}
      />

      <div className="pt-2">
        <Button variant="outline" onClick={openAddPhase}>
          <Plus />
          Add Phase
        </Button>
      </div>

      <TaskDialog
        open={dialogMode !== null}
        title={getDialogTitle()}
        form={form}
        onChange={setForm}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  )
}
