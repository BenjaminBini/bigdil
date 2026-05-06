import { useState } from 'react'
import { useParams } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { useProject, useCreateTask, useUpdateTask } from '@/api/hooks'
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
  const createTask = useCreateTask(projectId!)
  const updateTask = useUpdateTask(projectId!)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState />

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
    if (!form.name.trim()) {
      toast.error('Task name is required')
      return
    }

    if (dialogMode?.type === 'edit') {
      updateTask.mutate(
        { taskId: dialogMode.task.id, name: form.name, status: form.status },
        {
          onSuccess: () => { toast.success(`Task "${form.name}" updated`); handleClose() },
          onError: () => toast.error('Failed to update task'),
        },
      )
    } else {
      const parentTaskId = dialogMode?.type === 'add-sub-task' ? dialogMode.parentTask.id : null
      createTask.mutate(
        { name: form.name, status: form.status, parentTaskId },
        {
          onSuccess: () => { toast.success(`Task "${form.name}" created`); handleClose() },
          onError: () => toast.error('Failed to create task'),
        },
      )
    }
  }

  function getDialogTitle(): string {
    if (!dialogMode) return ''
    if (dialogMode.type === 'add-phase') return 'Add Phase'
    if (dialogMode.type === 'add-sub-task') return `Add Sub-task to "${dialogMode.parentTask.name}"`
    return `Edit "${dialogMode.task.name}"`
  }

  return (
    <PageContainer size="md">
      <FlexBetween>
        <div>
          <PageTitle>Work Breakdown Structure</PageTitle>
          <MutedText spacing="tight">
            Manage the phases and tasks for this project
          </MutedText>
        </div>
      </FlexBetween>

      <WbsTaskTree
        tasks={data.tasks}
        onAddSubTask={openAddSubTask}
        onEdit={openEdit}
      />

      <VStack gap="xl" pt="sm">
        <Button variant="outline" onClick={openAddPhase}>
          <Plus />
          Add Phase
        </Button>
      </VStack>

      <TaskDialog
        open={dialogMode !== null}
        title={getDialogTitle()}
        form={form}
        onChange={setForm}
        onSave={handleSave}
        onClose={handleClose}
        isPending={createTask.isPending || updateTask.isPending}
      />
    </PageContainer>
  )
}
