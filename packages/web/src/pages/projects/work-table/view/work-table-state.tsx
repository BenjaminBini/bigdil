import { Calendar, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState, ErrorState } from '@/components/shared/page-container'

export function WorkTableLoadingState() {
  return <LoadingState />
}

export function WorkTableProjectNotFound() {
  return <ErrorState message="Project not found." variant="muted" />
}

interface WorkTableUnavailableStateProps {
  hasDates: boolean
  onSetDates?: () => void
  onPlanProject?: () => void
}

export function WorkTableUnavailableState({ hasDates, onSetDates, onPlanProject }: WorkTableUnavailableStateProps) {
  if (hasDates) {
    return (
      <EmptyState
        icon={Play}
        title="Prêt à planifier"
        description="Les dates sont définies. Cliquez sur « Planifier » pour générer les périodes et accéder au tableau de planification."
        action={
          <Button onClick={onPlanProject}>
            <Play size={16} />
            Planifier le projet
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={Calendar}
      title="Dates requises"
      description="Définissez les dates de début et de fin du projet pour pouvoir planifier."
      action={
        <Button onClick={onSetDates}>
          <Calendar size={16} />
          Définir les dates
        </Button>
      }
    />
  )
}

export function WorkTableDataUnavailableState() {
  return <ErrorState message="Work table data not available for this project." variant="muted" />
}
