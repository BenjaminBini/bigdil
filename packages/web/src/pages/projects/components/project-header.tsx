import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { projectStatusLabels } from '@/lib/constants'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProjectKpiCard, type ProjectKpiCardProps } from './project-kpi-card'
import { ProjectActions } from './project-actions'

const tabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'WBS', path: 'wbs' },
  { label: 'Quotes', path: 'quotes' },
  { label: 'Work Table', path: 'work-table' },
  { label: 'Timesheets', path: 'timesheets' },
  { label: 'Snapshots', path: 'snapshots' },
]

interface ProjectHeaderProps {
  projectId: string
  name: string
  status: keyof typeof projectStatusLabels
  clientId: string
  clientName: string | null
  kpis: ProjectKpiCardProps[]
}

export function ProjectHeader({ projectId, name, status, clientId, clientName, kpis }: ProjectHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl space-y-4 px-6 pb-0 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-gray-500">
              Client:{' '}
              {clientName ? (
                <a href={`/clients/${clientId}`} className="font-medium text-blue-600 hover:underline" onClick={(event) => event.stopPropagation()}>
                  {clientName}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ProjectActions status={status} />
          </div>
        </div>

        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
          {kpis.map((kpi) => (
            <ProjectKpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <nav className="-mb-px flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/projects/${projectId}/${tab.path}`}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
