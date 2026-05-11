import { useLocation, useNavigate, useParams } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildBreadcrumbs } from './topbar/breadcrumbs'
import { ProjectSelector } from './topbar/project-selector'
import { ActivePeriodBadge } from './topbar/active-period-badge'
import { WindowControl } from './topbar/window-control'
import { UserMenu } from './topbar/user-menu'
import { ThemeToggle } from './topbar/theme-toggle'
import { LanguageToggle } from './topbar/language-toggle'

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
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <span key={idx} className="flex items-center gap-1 min-w-0">
              {idx > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
              {isLast ? (
                <span className="truncate font-semibold text-foreground">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => navigate(crumb.href)}
                  className={cn(
                    'truncate text-muted-foreground transition-colors hover:text-foreground',
                  )}
                >
                  {crumb.label}
                </button>
              )}
            </span>
          )
        })}
      </nav>

      {showProjectSelector && (
        <div className="flex shrink-0 items-center">
          <ProjectSelector projectId={projectId} onProjectChange={handleProjectChange} />
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {projectId && <ActivePeriodBadge projectId={projectId} />}
        <WindowControl />
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
