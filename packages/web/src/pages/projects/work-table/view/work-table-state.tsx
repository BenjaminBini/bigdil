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

export function WorkTableUnavailableState() {
  return (
    <EmptyState
      icon={Calendar}
      title="Work Table Not Available"
      description='Set project dates and plan to see the work table. This project is currently in "To Plan" status - define your timeline to unlock the planning grid.'
      action={
        <Button>
          <Calendar size={16} />
          Set Dates &amp; Plan
        </Button>
      }
    />
  )
}

export function WorkTableDataUnavailableState() {
  return <ErrorState message="Work table data not available for this project." variant="muted" />
}
