import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkTableLoadingState() {
  return <div className="p-6">Loading...</div>
}

export function WorkTableProjectNotFound() {
  return <div className="p-6 text-sm text-slate-500">Project not found.</div>
}

export function WorkTableUnavailableState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-400">
        <Calendar className="size-8" />
      </div>
      <div className="max-w-sm text-center">
        <h2 className="mb-2 text-xl font-semibold text-slate-800">Work Table Not Available</h2>
        <p className="text-sm leading-relaxed text-slate-500">
          Set project dates and plan to see the work table. This project is currently in "To Plan"
          status - define your timeline to unlock the planning grid.
        </p>
      </div>
      <Button>
        <Calendar className="size-4" />
        Set Dates &amp; Plan
      </Button>
    </div>
  )
}

export function WorkTableDataUnavailableState() {
  return <div className="p-6 text-sm text-slate-500">Work table data not available for this project.</div>
}
