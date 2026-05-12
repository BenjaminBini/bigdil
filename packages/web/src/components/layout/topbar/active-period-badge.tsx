import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { useProject } from '@/api/hooks'
import { cn } from '@/lib/utils'

interface ActivePeriodBadgeProps {
  projectId: string
}

export function ActivePeriodBadge({ projectId }: ActivePeriodBadgeProps) {
  const { t } = useTranslation('statuses')
  const { data: project, isLoading } = useProject(projectId)

  if (isLoading) {
    return <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
  }

  if (!project) return null

  const openPeriod = project.periods.find((p) => p.status === 'OPEN')
  const consolidationPeriod = project.periods.find((p) => p.status === 'CONSOLIDATION')
  const frozenPeriod = project.periods.filter((p) => p.status === 'FROZEN').at(-1)

  if (!openPeriod && !consolidationPeriod && !frozenPeriod) return null

  return (
    <div className="flex items-center gap-1.5">
      {openPeriod && (
        <Badge
          className={cn(
            'text-xs font-semibold',
            'border-primary/30 bg-primary/15 text-primary',
          )}
        >
          {openPeriod.label} {t('period.OPEN')}
        </Badge>
      )}
      {consolidationPeriod && (
        <Badge className="border-amber-500/30 bg-amber-500/15 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {consolidationPeriod.label} {t('period.CONSOLIDATION')}
        </Badge>
      )}
      {frozenPeriod && (
        <Badge className="border-border bg-muted text-xs font-medium text-muted-foreground">
          {frozenPeriod.label} {t('period.FROZEN')}
        </Badge>
      )}
    </div>
  )
}
