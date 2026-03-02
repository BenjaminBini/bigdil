import { Outlet, useParams } from 'react-router'
import { useProject } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import type { ProjectKpiCardProps } from './components/project-kpi-card'
import { ProjectHeader } from './components/project-header'

export default function ProjectLayout() {
  const { id: projectId } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading project</div>

  const validatedQuote = data.quotes.find((quote) => quote.status === 'VALIDATED') ?? data.quotes[0] ?? null
  const estimatedCost = validatedQuote ? validatedQuote.lines.reduce((sum, line) => sum + line.budgetCostAmount, 0) : null
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
      sub: validatedQuote ? 'from quote' : undefined,
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
    <div className="bg-gray-50">
      <ProjectHeader
        projectId={projectId ?? ''}
        name={data.name}
        status={data.status}
        clientId={data.clientId}
        clientName={data.clientName}
        kpis={kpis}
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </div>
    </div>
  )
}
