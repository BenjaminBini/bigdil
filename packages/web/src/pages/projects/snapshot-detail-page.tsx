import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSnapshot, useProject, useProjectTimesheets, useReferenceData } from '@/api/hooks'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { FlexRow, FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { TextCaption } from '@/components/shared/text-caption'
import { HintText } from '@/components/shared/hint-text'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { MetricsTab } from './snapshot-detail/metrics-tab'
import { ScopeTab } from './snapshot-detail/scope-tab'
import { WorkTableTab } from './snapshot-detail/work-table-tab'
import { ActualsTab } from './snapshot-detail/actuals-tab'

export default function SnapshotDetailPage() {
  const { t } = useTranslation('pages')
  const { id: projectId, snapshotId } = useParams()

  const { data: snapshot, isLoading: snapLoading, error: snapError } = useSnapshot(projectId!, snapshotId!)
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: allTimesheets, isLoading: tsLoading, error: tsError } = useProjectTimesheets(projectId!)

  const isLoading = snapLoading || projectLoading || refLoading || tsLoading
  const hasError = snapError || projectError || refError || tsError

  if (isLoading) return <LoadingState />
  if (hasError || !snapshot || !project || !refData || !allTimesheets) {
    return <ErrorState message={t('snapshots.notFound')} />
  }

  const getTaskName = (taskId: string) => project.flatTasks.find(task => task.id === taskId)?.name ?? taskId
  const getProfileName = (profileId: string) => refData.profiles.find(p => p.id === profileId)?.name ?? profileId
  const getEmployeeName = (employeeId: string | null) =>
    employeeId ? (refData.employees.find(e => e.id === employeeId)?.name ?? employeeId) : '—'

  function handleExport() {
    toast.info(t('snapshots.exporting'))
  }

  const marginPct =
    snapshot.metrics && snapshot.metrics.contractValue > 0
      ? (snapshot.metrics.marginForecast / snapshot.metrics.contractValue) * 100
      : 0

  return (
    <VStack gap="xl">
      <FlexBetween align="start" gap="lg" wrap>
        <VStack gap="xs">
          <FlexRow>
            <PageTitle>{t('snapshots.detailTitle', { periodCode: snapshot.periodCode })}</PageTitle>
            <StatusBadge status="CLOSED" />
          </FlexRow>
          <MutedText>
            {t('snapshots.snapshotRecorded', { date: formatDate(snapshot.snapshotAt) })}
            {snapshot.notes && (
              <HintText> "{snapshot.notes}"</HintText>
            )}
          </MutedText>
          {snapshot.metrics && (
            <TextCaption>
              {t('snapshots.margin', { value: formatCurrency(snapshot.metrics.marginForecast), pct: marginPct.toFixed(1) })}
            </TextCaption>
          )}
        </VStack>

        <Button variant="outline" onClick={handleExport}>
          <Download size={16} />
          {t('snapshots.exportBundle')}
        </Button>
      </FlexBetween>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">{t('snapshots.tabs.metrics')}</TabsTrigger>
          <TabsTrigger value="scope">{t('snapshots.tabs.scope')}</TabsTrigger>
          <TabsTrigger value="work-table">{t('snapshots.tabs.workTable')}</TabsTrigger>
          <TabsTrigger value="actuals">{t('snapshots.tabs.actuals')}</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          {snapshot.metrics ? (
            <MetricsTab metrics={snapshot.metrics} />
          ) : (
            <ErrorState message={t('snapshots.noMetrics')} variant="muted" />
          )}
        </TabsContent>

        <TabsContent value="scope">
          <ScopeTab
            rows={snapshot.scopeLines}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
          />
        </TabsContent>

        <TabsContent value="work-table">
          <WorkTableTab
            snapshot={snapshot}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
            getEmployeeName={getEmployeeName}
          />
        </TabsContent>

        <TabsContent value="actuals">
          <ActualsTab
            snapshot={snapshot}
            allTimesheets={allTimesheets}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
            getEmployeeName={(id) => getEmployeeName(id)}
          />
        </TabsContent>
      </Tabs>
    </VStack>
  )
}
