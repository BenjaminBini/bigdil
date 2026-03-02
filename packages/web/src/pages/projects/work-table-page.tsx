import { useParams } from 'react-router'
import { useProject, useReferenceData, useWorkTable } from '@/api/hooks'
import { ProjectWorkTable } from './work-table/project-work-table'
import {
  WorkTableDataUnavailableState,
  WorkTableLoadingState,
  WorkTableProjectNotFound,
  WorkTableUnavailableState,
} from './work-table/work-table-state'

export default function WorkTablePage() {
  const { id: projectId } = useParams<{ id: string }>()

  const { data: workTableData, isLoading: isLoadingWorkTable } = useWorkTable(projectId!)
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId!)

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
    />
  )
}
