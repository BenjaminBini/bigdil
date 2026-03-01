import { Badge } from '@/components/ui/badge'
import { useProject } from '@/api/hooks'
import { cn } from '@/lib/utils'

interface ActivePeriodBadgeProps {
  projectId: string
}

export function ActivePeriodBadge({ projectId }: ActivePeriodBadgeProps) {
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
            'bg-green-100 text-green-800 border-green-200',
          )}
        >
          W{openPeriod.periodNumber} Open
        </Badge>
      )}
      {consolidationPeriod && (
        <Badge className="border-amber-200 bg-amber-100 text-xs font-semibold text-amber-700">
          W{consolidationPeriod.periodNumber} Consolidation
        </Badge>
      )}
      {frozenPeriod && (
        <Badge className="border-gray-200 bg-gray-100 text-xs font-medium text-gray-600">
          W{frozenPeriod.periodNumber} Frozen
        </Badge>
      )}
    </div>
  )
}
