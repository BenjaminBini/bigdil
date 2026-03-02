import { CheckCircle2, ChevronLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { WarningButton } from '@/components/shared/button-adapters'
import { StatusItem } from '@/components/shared/status-item'
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
        <StatusItem
          icon={<Lock className="size-4 text-gray-400" />}
          title={`Period ${period.periodNumber} will be locked`}
          description={`No further timesheet edits will be possible for ${period.startDate} – ${period.endDate}.`}
        />
        <StatusItem
          icon={<CheckCircle2 className="size-4 text-green-600" />}
          title="Snapshot will be created"
          description="Metrics, scope lines, and work table rows will be frozen in a new snapshot."
        />
        <StatusItem
          icon={<CheckCircle2 className="size-4 text-blue-600" />}
          title="Next period becomes activatable"
          description={`Once Period ${period.periodNumber} is closed, the PM can activate the next period.`}
        />
        <StatusItem
          icon={<CheckCircle2 className="size-4 text-blue-600" />}
          title="Re-forecast saved"
          description="Your updated planned days for future periods will be persisted as the new work table."
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <WarningButton onClick={handleClose}>
          Close Period {period.periodNumber}
        </WarningButton>
      </div>
    </div>
  )
}
