import { NavLink, Outlet, useParams } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProject } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { projectStatusColors, projectStatusLabels } from '@/lib/constants'
import { ProjectKpiCard, type ProjectKpiCardProps } from './components/project-kpi-card'

// ---- Tab nav ----

const tabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'WBS', path: 'wbs' },
  { label: 'Quotes', path: 'quotes' },
  { label: 'Work Table', path: 'work-table' },
  { label: 'Timesheets', path: 'timesheets' },
  { label: 'Snapshots', path: 'snapshots' },
]

// ---- Layout ----

export default function ProjectLayout() {
  const { id: projectId } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(projectId ?? '')

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading project</div>

  // ---- KPI data ----
  // Use the validated quote to derive estimated cost and margin.
  // If no validated quote exists, fall back to any quote, or show blanks.
  const validatedQuote =
    data.quotes.find((q) => q.status === 'VALIDATED') ?? data.quotes[0] ?? null

  const estimatedCost = validatedQuote
    ? validatedQuote.lines.reduce((sum, l) => sum + l.budgetCostAmount, 0)
    : null

  const estimatedMarginEur =
    estimatedCost != null ? data.contractValue - estimatedCost : null

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
      sub:
        estimatedMarginPct != null
          ? `${estimatedMarginPct.toFixed(1)}% of contract`
          : undefined,
      highlight: estimatedMarginEur != null && estimatedMarginEur > 0,
    },
    { label: 'Actual Cost to Date', value: '—', dim: true },
    { label: 'EAC Cost', value: '—', dim: true },
    { label: 'Produced to Date', value: '—', dim: true },
  ]

  // ---- Action buttons ----
  function actionToast(label: string) {
    toast.info(`Would execute: ${label}`)
  }

  function renderActions() {
    switch (data?.status) {
      case 'IN_PROGRESS':
        return (
          <>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => actionToast('Activate Next Period')}
            >
              Activate Next Period
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => actionToast('Close Period')}
            >
              Close Period
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled
              title="Cannot complete while periods remain open"
            >
              Complete Project
            </Button>
          </>
        )
      case 'TO_PLAN':
        return (
          <>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => actionToast('Set Dates & Plan')}
            >
              Set Dates &amp; Plan
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled
              title="Complete planning before starting"
            >
              Start Project
            </Button>
          </>
        )
      case 'DRAFT':
        return (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => actionToast('Send for Approval')}
          >
            Send for Approval
          </Button>
        )
      case 'WAITING_APPROVAL':
        return (
          <>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => actionToast('Client Approved')}
            >
              Client Approved
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => actionToast('Client Rejected')}
            >
              Client Rejected
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Project header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-0 space-y-4">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {data.name}
                </h1>
                <Badge className={projectStatusColors[data.status]}>
                  {projectStatusLabels[data.status]}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Client:{' '}
                {data.clientName ? (
                  <a
                    href={`/clients/${data.clientId}`}
                    className="text-blue-600 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {data.clientName}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {renderActions()}
            </div>
          </div>

          {/* KPI strip */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
            {kpis.map((kpi) => (
              <ProjectKpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={`/projects/${projectId}/${tab.path}`}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </div>
    </div>
  )
}
