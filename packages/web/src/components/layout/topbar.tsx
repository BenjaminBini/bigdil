import { useLocation, useNavigate, useParams } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildBreadcrumbs } from './topbar/breadcrumbs'
import { ProjectSelector } from './topbar/project-selector'
import { ActivePeriodBadge } from './topbar/active-period-badge'
import { UserMenu } from './topbar/user-menu'
import { ThemeToggle } from './topbar/theme-toggle'

export interface TopbarProps {
  projectId?: string | null
  onProjectChange?: (id: string) => void
}

export function Topbar({ projectId: projectIdProp, onProjectChange }: TopbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const breadcrumbs = buildBreadcrumbs(pathname)

  // Route convention uses :id on project pages.
  const routeProjectId = (params.id ?? params.projectId ?? null) as string | null
  const projectId = projectIdProp !== undefined ? projectIdProp : routeProjectId
  const showProjectSelector = projectIdProp !== undefined

  function handleProjectChange(id: string) {
    if (onProjectChange) {
      onProjectChange(id)
      return
    }
    navigate(`/projects/${id}`)
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1 min-w-0">
            {idx > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
            <span
              className={cn(
                'truncate',
                idx === breadcrumbs.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {showProjectSelector && (
        <div className="flex shrink-0 items-center">
          <ProjectSelector projectId={projectId} onProjectChange={handleProjectChange} />
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {projectId && <ActivePeriodBadge projectId={projectId} />}
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
