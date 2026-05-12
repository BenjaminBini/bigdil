import { Outlet, useParams } from 'react-router'
import { useProject } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { DetailPageBackground } from '@/components/shared/detail-layout'
import type { ProjectKpiCardProps } from './components/project-kpi-card'
import { ProjectHeader } from './components/project-header'

export default function ProjectLayout() {
  const { id: projectId } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading project" />

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
    { label: 'Contract Value', value: formatCurrency(data.contractValue) },
    {
      label: 'Estimated Cost',
      value: estimatedCost != null ? formatCurrency(estimatedCost) : '—',
      sub: validatedQuotes.length > 0
        ? validatedQuotes.length > 1 ? `from ${validatedQuotes.length} validated quotes` : 'from validated quote'
        : 'no validated quote',
    },
    {
      label: 'Estimated Margin',
      value: estimatedMarginEur != null ? formatCurrency(estimatedMarginEur) : '—',
      sub: estimatedMarginPct != null ? `${estimatedMarginPct.toFixed(1)}% of contract` : undefined,
      highlight: estimatedMarginEur != null && estimatedMarginEur > 0,
    },
    { label: 'Actual Cost to Date', value: '—', dim: true },
    { label: 'EAC Cost', value: '—', dim: true },
    { label: 'Produced to Date', value: '—', dim: true },
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
