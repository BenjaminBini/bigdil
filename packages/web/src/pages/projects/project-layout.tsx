import { Outlet, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useProject } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { DetailPageBackground } from '@/components/shared/detail-layout'
import type { ProjectKpiCardProps } from './components/project-kpi-card'
import { ProjectHeader } from './components/project-header'

export default function ProjectLayout() {
  const { id: projectId } = useParams<{ id: string }>()
  const { t } = useTranslation('pages')
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={t('projectLayout.errorLoading')} />

  // KPI block only reflects VALIDATED quotes. Drafts and rejected quotes are
  // hypothetical — including them in the estimated cost on the project header
  // would imply commitments that haven't been signed off.
  const validatedQuotes = data.quotes.filter((quote) => quote.status === 'VALIDATED')
  const estimatedCost = validatedQuotes.length > 0
    ? validatedQuotes.reduce((sum, q) => sum + q.lines.reduce((s, l) => s + l.budgetCostAmount, 0), 0)
    : null
  const estimatedMarginEur = estimatedCost != null ? data.contractValue - estimatedCost : null
  const estimatedMarginPct =
    estimatedMarginEur != null && data.contractValue > 0
      ? (estimatedMarginEur / data.contractValue) * 100
      : null

  const kpis: ProjectKpiCardProps[] = [
    { label: t('projectLayout.kpi.contractValue'), value: formatCurrency(data.contractValue) },
    {
      label: t('projectLayout.kpi.estimatedCost'),
      value: estimatedCost != null ? formatCurrency(estimatedCost) : '—',
      sub: validatedQuotes.length > 0
        ? validatedQuotes.length > 1
          ? t('projectLayout.kpi.fromValidatedQuotes', { count: validatedQuotes.length })
          : t('projectLayout.kpi.fromValidatedQuote')
        : t('projectLayout.kpi.noValidatedQuote'),
    },
    {
      label: t('projectLayout.kpi.estimatedMargin'),
      value: estimatedMarginEur != null ? formatCurrency(estimatedMarginEur) : '—',
      sub: estimatedMarginPct != null ? t('projectLayout.kpi.ofContract', { pct: estimatedMarginPct.toFixed(1) }) : undefined,
      highlight: estimatedMarginEur != null && estimatedMarginEur > 0,
    },
    { label: t('projectLayout.kpi.actualCost'), value: '—', dim: true },
    { label: t('projectLayout.kpi.eacCost'), value: '—', dim: true },
    { label: t('projectLayout.kpi.produced'), value: '—', dim: true },
  ]

  return (
    <DetailPageBackground>
      <ProjectHeader
        projectId={projectId ?? ''}
        name={data.name}
        clientId={data.clientId}
        clientName={data.clientName}
        kpis={kpis}
        startDate={data.startDate}
        endDate={data.endDate}
        closedAt={data.closedAt}
        isActive={data.isActive}
      />
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DetailPageBackground>
  )
}
