import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailRow } from '@/components/shared/detail-row'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/format'
import type { ProjectDetail } from '@/api/types'

interface ProjectDetailsCardProps {
  project: ProjectDetail
}

export function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-100">
          <DetailRow label="Client" value={project.clientName ?? <span className="text-gray-400">—</span>} />
          <DetailRow
            label="Status"
            value={<StatusBadge status={project.status} />}
          />
          <DetailRow label="Start Date" value={project.startDate ? formatDate(project.startDate) : <span className="text-gray-400">Not set</span>} />
          <DetailRow label="End Date" value={project.endDate ? formatDate(project.endDate) : <span className="text-gray-400">Not set</span>} />
          <DetailRow label="Currency" value={project.currency} />
        </div>
      </CardContent>
    </Card>
  )
}
