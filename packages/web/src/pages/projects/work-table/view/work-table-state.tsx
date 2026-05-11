import { Calendar } from 'lucide-react'
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
  onSetDates?: () => void
}

// Surfaces when a project has no date range yet — the work table needs dates
// to render its period axis. Once dates are set the grid renders directly.
export function WorkTableUnavailableState({ onSetDates }: WorkTableUnavailableStateProps) {
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
