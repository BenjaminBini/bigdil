import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { useProject, useReferenceData, useWorkTable, useUpdateCell, useAssignEmployee, useUpdateProjectStatus } from '@/api/hooks'
import { ProjectWorkTable } from './work-table/project-work-table'
import {
  WorkTableDataUnavailableState,
  WorkTableLoadingState,
  WorkTableProjectNotFound,
  WorkTableUnavailableState,
} from './work-table/view/work-table-state'
import { EditProjectDialog } from './components/edit-project-dialog'

export default function WorkTablePage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [showEdit, setShowEdit] = useState(false)

  const { data: workTableData, isLoading: isLoadingWorkTable } = useWorkTable(projectId!)
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId!)
  const updateCell = useUpdateCell(projectId!)
  const assignEmployee = useAssignEmployee(projectId!)
  const updateStatus = useUpdateProjectStatus(projectId!)

  function handleSaveCell(params: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) {
    updateCell.mutate(params, {
      onError: () => toast.error('Failed to save planned days'),
    })
  }

  function handleAssignEmployee(params: { taskId: string; profileId: string; employeeId: string }) {
    assignEmployee.mutate(params, {
      onSuccess: (data) => {
        const result = data as { moved?: number; seeded?: boolean; alreadyAssigned?: boolean }
        if (result.alreadyAssigned) {
          toast.info('Collaborateur déjà assigné à ce poste')
        } else {
          toast.success('Collaborateur assigné')
        }
      },
      onError: () => toast.error('Échec de l\'assignation'),
    })
  }

  if (isLoadingWorkTable || isLoadingRef || isLoadingProject) {
    return <WorkTableLoadingState />
  }

  if (!project) {
    return <WorkTableProjectNotFound />
  }

  if (project.status === 'TO_PLAN') {
    const hasDates = !!(project.startDate && project.endDate)
    return (
      <>
        <WorkTableUnavailableState
          hasDates={hasDates}
          onSetDates={() => setShowEdit(true)}
          onPlanProject={() =>
            updateStatus.mutate('PLANNING', {
              onSuccess: () => toast.success('Périodes générées — projet en mode planification'),
              onError: (err) => toast.error(err instanceof Error ? err.message : 'Échec de la planification'),
            })
          }
        />
        <EditProjectDialog project={project} open={showEdit} onClose={() => setShowEdit(false)} />
      </>
    )
  }

  if (!workTableData || !refData) {
    return <WorkTableDataUnavailableState />
  }

  return (
    <ProjectWorkTable
      projectId={projectId!}
      project={project}
      periods={workTableData.periods}
      workTable={workTableData.cells}
      flatTasks={workTableData.tasks}
      quotes={workTableData.quotes}
      periodStartData={workTableData.periodStarts}
      profiles={refData.profiles}
      employees={refData.employees}
      onSaveCell={handleSaveCell}
      onAssignEmployee={handleAssignEmployee}
    />
  )
}
