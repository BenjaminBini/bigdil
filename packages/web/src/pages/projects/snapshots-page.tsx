import { useState } from 'react'
import { useParams } from 'react-router'
import { useProject, useSnapshots } from '@/api/hooks'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import PeriodCloseWizard from './period-close-wizard'
import { SnapshotSummaryStrip } from './snapshots/snapshot-summary-strip'
import { SnapshotsTable } from './snapshots/snapshots-table'

export default function SnapshotsPage() {
  const { id: projectId } = useParams()
  const [wizardOpen, setWizardOpen] = useState(false)

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: snapshots, isLoading: snapshotsLoading, error: snapshotsError } = useSnapshots(projectId!)

  if (projectLoading || snapshotsLoading) return <LoadingState />
  if (projectError || snapshotsError || !project || !snapshots) {
    return <ErrorState />
  }

  return (
    <VStack gap="xl">
      <FlexBetween>
        <div>
          <PageTitle>Periods &amp; Snapshots</PageTitle>
          <MutedText spacing="tight">
            {project.periods.length} periods - {snapshots.length} snapshots recorded
          </MutedText>
        </div>
      </FlexBetween>

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
    </VStack>
  )
}
