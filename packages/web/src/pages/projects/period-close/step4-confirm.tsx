import { CheckCircle2, ChevronLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WarningButton } from '@/components/shared/button-adapters'
import { StatusItem } from '@/components/shared/status-item'
import { MutedText } from '@/components/shared/muted-text'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { useFreezePeriod } from '@/api/hooks'
import type { Period } from '@/api/types'

interface Step4Props {
  period: Period
  projectId: string
  onBack: () => void
  onClose: () => void
}

export function Step4Confirm({ period, projectId, onBack, onClose }: Step4Props) {
  const freezePeriod = useFreezePeriod(projectId)

  function handleClose() {
    freezePeriod.mutate(period.id, {
      onSuccess: () => {
        toast.success(`Period ${period.periodNumber} closed. Next period is ready to activate.`)
        onClose()
      },
      onError: () => toast.error(`Failed to close Period ${period.periodNumber}`),
    })
  }

  return (
    <VStack gap="xl">
      <MutedText>
        You are about to permanently close Period {period.periodNumber}. This action cannot be undone.
      </MutedText>

      <Card variant="muted">
        <StatusItem
          icon={<Lock size={16} color="#9ca3af" />}
          title={`Period ${period.periodNumber} will be locked`}
          description={`No further timesheet edits will be possible for ${period.startDate} – ${period.endDate}.`}
        />
        <StatusItem
          icon={<CheckCircle2 size={16} color="#16a34a" />}
          title="Snapshot will be created"
          description="Metrics, scope lines, and work table rows will be frozen in a new snapshot."
        />
        <StatusItem
          icon={<CheckCircle2 size={16} color="#2563eb" />}
          title="Next period becomes activatable"
          description={`Once Period ${period.periodNumber} is closed, the PM can activate the next period.`}
        />
        <StatusItem
          icon={<CheckCircle2 size={16} color="#2563eb" />}
          title="Re-forecast saved"
          description="Your updated planned days for future periods will be persisted as the new work table."
        />
      </Card>

      <FlexBetween>
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft size={16} />
          Back
        </Button>
        <WarningButton onClick={handleClose} disabled={freezePeriod.isPending}>
          {freezePeriod.isPending ? 'Closing…' : `Close Period ${period.periodNumber}`}
        </WarningButton>
      </FlexBetween>
    </VStack>
  )
}
