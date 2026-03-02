import { useState } from 'react'
import { useParams } from 'react-router'
import { useProject, useSnapshots } from '@/api/hooks'
import PeriodCloseWizard from './period-close-wizard'
import { SnapshotSummaryStrip } from './snapshots/snapshot-summary-strip'
import { SnapshotsTable } from './snapshots/snapshots-table'

export default function SnapshotsPage() {
  const { id: projectId } = useParams()
  const [wizardOpen, setWizardOpen] = useState(false)

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: snapshots, isLoading: snapshotsLoading, error: snapshotsError } = useSnapshots(projectId!)

  if (projectLoading || snapshotsLoading) return <div className="p-6">Loading...</div>
  if (projectError || snapshotsError || !project || !snapshots) {
    return <div className="p-6">Error loading data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Periods &amp; Snapshots</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {project.periods.length} periods - {snapshots.length} snapshots recorded
          </p>
        </div>
      </div>

      <SnapshotsTable
        periods={project.periods}
        snapshots={snapshots}
        contractValue={project.contractValue}
        projectId={projectId ?? ''}
        onFreezePeriod={() => setWizardOpen(true)}
      />

      <SnapshotSummaryStrip snapshots={snapshots} />

      <PeriodCloseWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        projectId={projectId!}
      />
    </div>
  )
}
