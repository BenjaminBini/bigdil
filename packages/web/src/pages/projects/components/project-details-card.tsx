import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { projectStatusColors, projectStatusLabels } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { ProjectDetail } from '@/api/types'

interface ProjectDetailsCardProps {
  project: ProjectDetail
}

export function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Project Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-gray-100">
          <DetailRow label="Client" value={project.clientName ?? <span className="text-gray-400">—</span>} />
          <DetailRow
            label="Status"
            value={<Badge className={projectStatusColors[project.status]}>{projectStatusLabels[project.status]}</Badge>}
          />
          <DetailRow label="Start Date" value={project.startDate ? formatDate(project.startDate) : <span className="text-gray-400">Not set</span>} />
          <DetailRow label="End Date" value={project.endDate ? formatDate(project.endDate) : <span className="text-gray-400">Not set</span>} />
          <DetailRow label="Currency" value={project.currency} />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-2 last:border-0">
      <span className="shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}
