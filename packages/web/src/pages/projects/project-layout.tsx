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

  const validatedQuotes = data.quotes.filter((quote) => quote.status === 'VALIDATED')
  const quotesForKpi = validatedQuotes.length > 0 ? validatedQuotes : (data.quotes[0] ? [data.quotes[0]] : [])
  const estimatedCost = quotesForKpi.length > 0
    ? quotesForKpi.reduce((sum, q) => sum + q.lines.reduce((s, l) => s + l.budgetCostAmount, 0), 0)
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
      sub: quotesForKpi.length > 0
        ? quotesForKpi.length > 1 ? `from ${quotesForKpi.length} quotes` : 'from quote'
        : undefined,
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
        status={data.status}
        clientId={data.clientId}
        clientName={data.clientName}
        kpis={kpis}
        startDate={data.startDate}
        endDate={data.endDate}
      />
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DetailPageBackground>
  )
}
