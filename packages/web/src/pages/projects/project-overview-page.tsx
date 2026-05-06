import { useState } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { useProject } from '@/api/hooks'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { DetailGrid } from '@/components/shared/layouts'
import { ProjectActivityTimeline } from './components/project-activity-timeline'
import { ProjectDetailsCard } from './components/project-details-card'
import { ProjectNextStepsCard } from './components/project-next-steps-card'
import { PeriodProgressCard } from './components/period-progress-card'
import { EditProjectDialog } from './components/edit-project-dialog'

function SideColumn({ children }: { children: ReactNode }) {
  return <div className="space-y-6 lg:col-span-1">{children}</div>
}

function MainColumn({ children }: { children: ReactNode }) {
  return <div className="lg:col-span-2">{children}</div>
}

export default function ProjectOverviewPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [showEdit, setShowEdit] = useState(false)
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading project" />

  const detailsCard = <ProjectDetailsCard project={data} onEdit={() => setShowEdit(true)} />

  return (
    <>
      {data.periods.length > 0 ? (
        <DetailGrid>
          <SideColumn>
            {detailsCard}
            <PeriodProgressCard periods={data.periods} />
          </SideColumn>
          <MainColumn>
            <ProjectActivityTimeline periods={data.periods} />
          </MainColumn>
        </DetailGrid>
      ) : (
        <DetailGrid>
          <SideColumn>{detailsCard}</SideColumn>
          <MainColumn><ProjectNextStepsCard /></MainColumn>
        </DetailGrid>
      )}

      <EditProjectDialog
        project={data}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </>
  )
}
