import { Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailRow } from '@/components/shared/detail-row'
import { StatusBadge } from '@/components/shared/status-badge'
import { NullCell, NullText } from '@/components/shared/table-cells'
import { DivideStack } from '@/components/shared/layouts'
import { formatDate } from '@/lib/format'
import type { ProjectDetail } from '@/api/types'
import { deriveProjectLifecycle } from '@/lib/constants'

interface ProjectDetailsCardProps {
  project: ProjectDetail
  onEdit?: () => void
}

export function ProjectDetailsCard({ project, onEdit }: ProjectDetailsCardProps) {
  return (
    <Card variant="compact">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Détails du projet</CardTitle>
        {onEdit && (
          <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Modifier le projet">
            <Pencil size={14} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DivideStack>
          <DetailRow label="Client" value={project.clientName ?? <NullCell />} />
          <DetailRow
            label="Statut"
            value={<StatusBadge status={deriveProjectLifecycle(project)} />}
          />
          <DetailRow label="Date de début" value={project.startDate ? formatDate(project.startDate) : <NullText />} />
          <DetailRow label="Date de fin" value={project.endDate ? formatDate(project.endDate) : <NullText />} />
          <DetailRow label="Devise" value={project.currency} />
        </DivideStack>
      </CardContent>
    </Card>
  )
}
