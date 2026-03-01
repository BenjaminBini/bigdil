import { CheckCircle2, ChevronLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Period } from '@/api/types'

interface Step4Props {
  period: Period
  onBack: () => void
  onClose: () => void
}

export function Step4Confirm({ period, onBack, onClose }: Step4Props) {
  function handleClose() {
    toast.success(`Period ${period.periodNumber} closed successfully. Next period is ready to activate.`)
    onClose()
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        You are about to permanently close Period {period.periodNumber}. This action cannot be undone.
      </p>

      <div className="rounded-lg border bg-gray-50 divide-y text-sm">
        <div className="flex items-start gap-3 p-4">
          <Lock className="size-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Period {period.periodNumber} will be locked</p>
            <p className="text-gray-500 text-xs mt-0.5">
              No further timesheet edits will be possible for {period.startDate} – {period.endDate}.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Snapshot will be created</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Metrics, scope lines, and work table rows will be frozen in a new snapshot.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="size-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Next period becomes activatable</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Once Period {period.periodNumber} is closed, the PM can activate the next period.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="size-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Re-forecast saved</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Your updated planned days for future periods will be persisted as the new work table.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleClose}>
          Close Period {period.periodNumber}
        </Button>
      </div>
    </div>
  )
}
