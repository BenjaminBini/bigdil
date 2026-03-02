import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projectStatusColors } from '@/lib/constants'
import type { DashboardData } from '@/api/types'

interface ActiveProjectsCardProps {
  projects: DashboardData['activeProjectsList']
}

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-muted-foreground">{project.clientName}</div>
              </div>
              <Badge className={projectStatusColors[project.status]}>{project.status}</Badge>
            </Link>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground">No active projects</p>}
        </div>
      </CardContent>
    </Card>
  )
}
