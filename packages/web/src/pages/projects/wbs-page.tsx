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
import {
  useProject,
  useCreatePhase,
  useUpdatePhase,
  useDeletePhase,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/api/hooks'
import type { Phase, Task } from '@/api/types'
import { WbsTaskTree } from './wbs/task-tree'
import { TaskDialog, type TaskFormState } from './wbs/task-dialog'

type DialogMode =
  | { type: 'add-phase' }
  | { type: 'add-task'; phase: Phase }
  | { type: 'edit-phase'; phase: Phase }
  | { type: 'edit-task'; task: Task }
  | null

const emptyForm: TaskFormState = {
  name: '',
  description: '',
  status: 'planned',
}

export default function WbsPage() {
  const { id: projectId } = useParams()
  const { data, isLoading, error } = useProject(projectId!)
  const createPhase = useCreatePhase(projectId!)
  const updatePhase = useUpdatePhase(projectId!)
  const deletePhase = useDeletePhase(projectId!)
  const createTask = useCreateTask(projectId!)
  const updateTask = useUpdateTask(projectId!)
  const deleteTask = useDeleteTask(projectId!)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState />

  function openAddPhase() {
    setForm(emptyForm)
    setDialogMode({ type: 'add-phase' })
  }

  function openAddTask(phase: Phase) {
    setForm(emptyForm)
    setDialogMode({ type: 'add-task', phase })
  }

  function openEditPhase(phase: Phase) {
    setForm({ name: phase.name, description: '', status: 'planned' })
    setDialogMode({ type: 'edit-phase', phase })
  }

  function openEditTask(task: Task) {
    setForm({ name: task.name, description: '', status: task.status })
    setDialogMode({ type: 'edit-task', task })
  }

  function handleDeletePhase(phase: Phase) {
    deletePhase.mutate(phase.id, {
      onSuccess: () => toast.success(`"${phase.name}" supprimé`),
      onError: () => toast.error('Échec de la suppression'),
    })
  }

  function handleDeleteTask(task: Task) {
    deleteTask.mutate(task.id, {
      onSuccess: () => toast.success(`"${task.name}" supprimé`),
      onError: () => toast.error('Échec de la suppression'),
    })
  }

  function handleClose() {
    setDialogMode(null)
    setForm(emptyForm)
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!dialogMode) return

    if (dialogMode.type === 'edit-task') {
      updateTask.mutate(
        { taskId: dialogMode.task.id, name: form.name, status: form.status },
        {
          onSuccess: () => { toast.success(`Task "${form.name}" updated`); handleClose() },
          onError: () => toast.error('Failed to update task'),
        },
      )
    } else if (dialogMode.type === 'edit-phase') {
      updatePhase.mutate(
        { phaseId: dialogMode.phase.id, name: form.name },
        {
          onSuccess: () => { toast.success(`Phase "${form.name}" updated`); handleClose() },
          onError: () => toast.error('Failed to update phase'),
        },
      )
    } else if (dialogMode.type === 'add-task') {
      createTask.mutate(
        { phaseId: dialogMode.phase.id, name: form.name, status: form.status },
        {
          onSuccess: () => { toast.success(`Task "${form.name}" created`); handleClose() },
          onError: () => toast.error('Failed to create task'),
        },
      )
    } else {
      createPhase.mutate(
        { name: form.name },
        {
          onSuccess: () => { toast.success(`Phase "${form.name}" created`); handleClose() },
          onError: () => toast.error('Failed to create phase'),
        },
      )
    }
  }

  function getDialogTitle(): string {
    if (!dialogMode) return ''
    if (dialogMode.type === 'add-phase') return 'Add Phase'
    if (dialogMode.type === 'add-task') return `Add Task to "${dialogMode.phase.name}"`
    if (dialogMode.type === 'edit-phase') return `Edit phase "${dialogMode.phase.name}"`
    return `Edit "${dialogMode.task.name}"`
  }

  const isPhaseDialog = dialogMode?.type === 'add-phase' || dialogMode?.type === 'edit-phase'

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
        phases={data.phases}
        onAddTask={openAddTask}
        onEditPhase={openEditPhase}
        onDeletePhase={handleDeletePhase}
        onEditTask={openEditTask}
        onDeleteTask={handleDeleteTask}
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
        isPending={createTask.isPending || updateTask.isPending || createPhase.isPending || updatePhase.isPending}
        hideStatus={isPhaseDialog}
      />
    </PageContainer>
  )
}
