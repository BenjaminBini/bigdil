import { useState } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useProject, useReferenceData, useWorkTable, useUpdateCell, useAssignEmployee } from '@/api/hooks'
import { PageContainer } from '@/components/shared/page-container'
import { ProjectWorkTable } from './work-table/project-work-table'
import {
  WorkTableDataUnavailableState,
  WorkTableLoadingState,
  WorkTableProjectNotFound,
  WorkTableUnavailableState,
} from './work-table/view/work-table-state'
import { EditProjectDialog } from './components/edit-project-dialog'

export default function WorkTablePage() {
  const { t } = useTranslation('pages')
  const { id: projectId } = useParams<{ id: string }>()
  const [showEdit, setShowEdit] = useState(false)

  const { data: workTableData, isLoading: isLoadingWorkTable } = useWorkTable(projectId!)
  const { data: refData, isLoading: isLoadingRef } = useReferenceData()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId!)
  const updateCell = useUpdateCell(projectId!)
  const assignEmployee = useAssignEmployee(projectId!)

  function handleSaveCell(params: { taskId: string; profileId: string; employeeId?: string; periodCode: string; days: number }) {
    updateCell.mutate(params, {
      onError: () => toast.error(t('workTable.saveCellFailed')),
    })
  }

  function handleAssignEmployee(params: { taskId: string; profileId: string; employeeId: string }) {
    assignEmployee.mutate(params, {
      onSuccess: (data) => {
        const result = data as { moved?: number; seeded?: boolean; alreadyAssigned?: boolean }
        if (result.alreadyAssigned) {
          toast.info(t('workTable.alreadyAssigned'))
        } else {
          toast.success(t('workTable.assigned'))
        }
      },
      onError: () => toast.error(t('workTable.assignFailed')),
    })
  }

  if (isLoadingWorkTable || isLoadingRef || isLoadingProject) {
    return <WorkTableLoadingState />
  }

  if (!project) {
    return (
      <PageContainer size="full">
        <WorkTableProjectNotFound />
      </PageContainer>
    )
  }

  // Work table needs a date range to render its period axis. Without it the
  // grid would be empty — surface a "set dates" prompt instead of a blank
  // table. After dates are set the grid renders directly (no manual "plan"
  // step since periods are now derived globally).
  if (!project.startDate || !project.endDate) {
    return (
      <PageContainer size="full">
        <WorkTableUnavailableState onSetDates={() => setShowEdit(true)} />
        <EditProjectDialog project={project} open={showEdit} onClose={() => setShowEdit(false)} />
      </PageContainer>
    )
  }

  if (!workTableData || !refData) {
    return (
      <PageContainer size="full">
        <WorkTableDataUnavailableState />
      </PageContainer>
    )
  }

  // Future-effective validated quotes are excluded from the work table until
  // their effectiveAt date passes — pre-effective avenants must not pollute
  // current quoted totals or the consolidation preview.
  const today = new Date().toISOString().slice(0, 10)
  const effectiveQuotes = workTableData.quotes.filter(
    (q) => q.status !== 'VALIDATED' || !q.effectiveAt || q.effectiveAt <= today,
  )

  return (
    <PageContainer size="full">
      <ProjectWorkTable
        projectId={projectId!}
        project={project}
        periods={workTableData.periods}
        workTable={workTableData.cells}
        phases={workTableData.phases}
        quotes={effectiveQuotes}
        periodStartData={workTableData.periodStarts}
        previousSnapshotRaf={workTableData.previousSnapshotRaf}
        previousSnapshotMonthCode={workTableData.previousSnapshotMonthCode}
        profiles={refData.profiles}
        employees={refData.employees}
        onSaveCell={handleSaveCell}
        onAssignEmployee={handleAssignEmployee}
      />
    </PageContainer>
  )
}
