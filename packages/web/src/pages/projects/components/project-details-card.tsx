import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  return (
    <Card variant="compact">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('projectLayout.detailsTitle')}</CardTitle>
        {onEdit && (
          <Button variant="ghost" size="icon-sm" onClick={onEdit} title={t('projectLayout.editProject')}>
            <Pencil size={14} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DivideStack>
          <DetailRow label={t('projectLayout.client')} value={project.clientName ?? <NullCell />} />
          <DetailRow
            label={t('projectLayout.status')}
            value={<StatusBadge status={deriveProjectLifecycle(project)} />}
          />
          <DetailRow label={t('projectLayout.startDate')} value={project.startDate ? formatDate(project.startDate) : <NullText />} />
          <DetailRow label={t('projectLayout.endDate')} value={project.endDate ? formatDate(project.endDate) : <NullText />} />
          <DetailRow label={t('projectLayout.currency')} value={project.currency} />
        </DivideStack>
      </CardContent>
    </Card>
  )
}
