import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'

export function WorkTableLoadingState() {
  return <div className="p-6">Loading...</div>
}

export function WorkTableProjectNotFound() {
  return <div className="p-6 text-sm text-slate-500">Project not found.</div>
}

export function WorkTableUnavailableState() {
  return (
    <EmptyState
      icon={Calendar}
      title="Work Table Not Available"
      description='Set project dates and plan to see the work table. This project is currently in "To Plan" status - define your timeline to unlock the planning grid.'
      action={
        <Button>
          <Calendar className="size-4" />
          Set Dates &amp; Plan
        </Button>
      }
    />
  )
}

export function WorkTableDataUnavailableState() {
  return <div className="p-6 text-sm text-slate-500">Work table data not available for this project.</div>
}
