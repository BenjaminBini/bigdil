import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Camera, Eye } from 'lucide-react'
import { useProject, useSnapshots, useCreateSnapshot } from '@/api/hooks'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { PageTitle, SectionTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { TdPrimary, TdNumeric, TdDetail, TdRight, NullCell } from '@/components/shared/table-cells'
import { EmptyRow } from '@/components/shared/empty-row'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PeriodInfo, Snapshot } from '@/api/types'
import { SnapshotSummaryStrip } from './snapshots/snapshot-summary-strip'

interface PendingMonth {
  monthCode: string
  monthLabel: string
  weekCount: number
  startDate: string
  endDate: string
}

// Group weekly periods by month, then keep only months whose every period is
// past the open window (FROZEN) and that have no snapshot recorded yet.
function buildPendingMonths(
  periods: PeriodInfo[],
  snapshotMonthCodes: Set<string>,
): PendingMonth[] {
  const byMonth = new Map<string, PeriodInfo[]>()
  for (const period of periods) {
    if (!byMonth.has(period.monthCode)) byMonth.set(period.monthCode, [])
    byMonth.get(period.monthCode)!.push(period)
  }

  const pending: PendingMonth[] = []
  for (const [monthCode, monthPeriods] of byMonth) {
    if (snapshotMonthCodes.has(monthCode)) continue
    const allFrozen = monthPeriods.every((p) => p.status === 'FROZEN')
    if (!allFrozen) continue

    const sorted = [...monthPeriods].sort((a, b) => a.startDate.localeCompare(b.startDate))
    pending.push({
      monthCode,
      monthLabel: sorted[0]?.groupLabel ?? monthCode,
      weekCount: monthPeriods.length,
      startDate: sorted[0]?.startDate ?? '',
      endDate: sorted[sorted.length - 1]?.endDate ?? '',
    })
  }
  return pending.sort((a, b) => a.monthCode.localeCompare(b.monthCode))
}

interface PendingMonthsCardProps {
  pending: PendingMonth[]
  onCreateSnapshot: (monthCode: string) => void
  isPending: boolean
}

function PendingMonthsCard({ pending, onCreateSnapshot, isPending }: PendingMonthsCardProps) {
  const { t } = useTranslation('pages')
  if (pending.length === 0) {
    return (
      <Card>
        <SectionTitle>{t('snapshots.pendingTitle')}</SectionTitle>
        <MutedText spacing="tight">{t('snapshots.pendingEmpty')}</MutedText>
      </Card>
    )
  }

  return (
    <VStack gap="md">
      <SectionTitle>{t('snapshots.pendingTitle')}</SectionTitle>
      {pending.map((month) => (
        <Card key={month.monthCode}>
          <FlexBetween>
            <div>
              <p className="text-base font-semibold text-foreground">{month.monthLabel}</p>
              <MutedText spacing="tight">
                {month.weekCount} weeks · {formatDate(month.startDate)} – {formatDate(month.endDate)}
              </MutedText>
              <MutedText spacing="tight">{t('snapshots.pendingHint')}</MutedText>
            </div>
            <Button onClick={() => onCreateSnapshot(month.monthCode)} disabled={isPending}>
              <Camera size={14} />
              {t('snapshots.createSnapshot')}
            </Button>
          </FlexBetween>
        </Card>
      ))}
    </VStack>
  )
}

interface SnapshotsListProps {
  snapshots: Snapshot[]
  projectId: string
}

function SnapshotsList({ snapshots, projectId }: SnapshotsListProps) {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const dash = <NullCell />

  return (
    <Card variant="flush" className="w-fit max-w-full">
      <Table fit>
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Month" />
            <HeadCell label="Snapshot Date" />
            <HeadCell label="Contract Value" align="right" />
            <HeadCell label="Margin Forecast" align="right" />
            <HeadCell label="Produced Value" align="right" />
            <HeadCell label="Actions" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.length === 0 ? (
            <EmptyRow colSpan={6} message={t('snapshots.snapshotsEmpty')} />
          ) : (
            snapshots.map((snapshot) => (
              <TableRow key={snapshot.id} className="hover:bg-gray-50">
                <TdPrimary tabularNums>{snapshot.periodCode}</TdPrimary>
                <TdDetail tabularNums nowrap>{formatDate(snapshot.snapshotAt)}</TdDetail>
                <TdNumeric>
                  {snapshot.metrics?.contractValue != null
                    ? formatCurrency(snapshot.metrics.contractValue)
                    : dash}
                </TdNumeric>
                <TdNumeric>
                  {snapshot.metrics?.marginForecast != null
                    ? formatCurrency(snapshot.metrics.marginForecast)
                    : dash}
                </TdNumeric>
                <TdNumeric>
                  {snapshot.metrics?.producedExecutionValuePeriod != null
                    ? formatCurrency(snapshot.metrics.producedExecutionValuePeriod)
                    : dash}
                </TdNumeric>
                <TdRight nowrap>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projects/${projectId}/snapshots/${snapshot.id}`)}
                  >
                    <Eye size={14} />
                    View
                  </Button>
                </TdRight>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default function SnapshotsPage() {
  const { id: projectId } = useParams()
  const { t } = useTranslation('pages')

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: snapshots, isLoading: snapshotsLoading, error: snapshotsError } = useSnapshots(projectId!)
  const createSnapshot = useCreateSnapshot(projectId!)

  if (projectLoading || snapshotsLoading) return <LoadingState />
  if (projectError || snapshotsError || !project || !snapshots) {
    return <ErrorState />
  }

  const snapshotMonthCodes = new Set(snapshots.map((s) => s.periodCode))
  const pending = buildPendingMonths(project.periods, snapshotMonthCodes)

  function handleCreateSnapshot(monthCode: string) {
    createSnapshot.mutate(monthCode, {
      onSuccess: () => toast.success(`Snapshot created for ${monthCode}`),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <PageContainer>
      <FlexBetween>
        <div>
          <PageTitle as="h2">{t('snapshots.title')}</PageTitle>
          <MutedText spacing="tight">
            {t('snapshots.subtitle', { pending: pending.length, snapshots: snapshots.length })}
          </MutedText>
        </div>
      </FlexBetween>

      <PendingMonthsCard
        pending={pending}
        onCreateSnapshot={handleCreateSnapshot}
        isPending={createSnapshot.isPending}
      />

      <VStack gap="md">
        <SectionTitle>{t('snapshots.snapshotsTitle')}</SectionTitle>
        <SnapshotsList snapshots={snapshots} projectId={projectId ?? ''} />
      </VStack>

      <SnapshotSummaryStrip snapshots={snapshots} />
    </PageContainer>
  )
}
