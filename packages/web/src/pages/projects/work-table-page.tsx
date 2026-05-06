import { useParams } from 'react-router'
import { toast } from 'sonner'
import { useProject, useReferenceData, useWorkTable, useUpdateCell } from '@/api/hooks'
import { ProjectWorkTable } from './work-table/project-work-table'
import {
  WorkTableDataUnavailableState,
  WorkTableLoadingState,
  WorkTableProjectNotFound,
  WorkTableUnavailableState,
} from './work-table/view/work-table-state'

export default function WorkTablePage() {
  const { id: projectId } = useParams<{ id: string }>()

  const { data: workTableData, isLoading: isLoadingWorkTable } = useWorkTable(projectId!)
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId!)
  const updateCell = useUpdateCell(projectId!)

  function handleSaveCell(params: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) {
    updateCell.mutate(params, {
      onError: () => toast.error('Failed to save planned days'),
    })
  }

  if (isLoadingWorkTable || isLoadingRef || isLoadingProject) {
    return <WorkTableLoadingState />
  }

  if (!project) {
    return <WorkTableProjectNotFound />
  }

  if (project.status === 'TO_PLAN') {
    return <WorkTableUnavailableState />
  }

  if (!workTableData || !refData) {
    return <WorkTableDataUnavailableState />
  }

  return (
    <ProjectWorkTable
      project={project}
      periods={workTableData.periods}
      workTable={workTableData.cells}
      flatTasks={workTableData.tasks}
      quotes={workTableData.quotes}
      periodStartData={workTableData.periodStarts}
      profiles={refData.profiles}
      employees={refData.employees}
      onSaveCell={handleSaveCell}
    />
  )
}
