import { useParams } from 'react-router'
import { useProject } from '@/api/hooks'
import { ProjectActivityTimeline } from './components/project-activity-timeline'
import { ProjectDetailsCard } from './components/project-details-card'
import { ProjectNextStepsCard } from './components/project-next-steps-card'
import { PeriodProgressCard } from './components/period-progress-card'

export default function ProjectOverviewPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading project</div>

  if (data.periods.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ProjectDetailsCard project={data} />
          <PeriodProgressCard periods={data.periods} />
        </div>
        <div className="lg:col-span-2">
          <ProjectActivityTimeline periods={data.periods} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ProjectDetailsCard project={data} />
      </div>
      <div className="lg:col-span-2">
        <ProjectNextStepsCard />
      </div>
    </div>
  )
}
