import { useState } from 'react'
import { FastForward } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAdvanceTimesheetWindow, useCurrentUser, useTimesheetWindow } from '@/api/hooks'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { getPeriodLabel, parsePeriodSliceKey } from '@/lib/period-utils'

// Admin-only control to shift the global open week forward.
// Backend (POST /api/timesheet-window/advance) blocks if:
//  - current open period still has DRAFT/REJECTED timesheets
//  - month rollover but old month has non-APPROVED timesheets
// Both errors surface via toast.
export function WindowControl() {
  const { data: session } = useCurrentUser()
  const { data: window } = useTimesheetWindow()
  const advance = useAdvanceTimesheetWindow()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (session?.realUser.role !== 'ADMIN' || !window) return null

  const { weekCode, monthCode } = parsePeriodSliceKey(window.openPeriodKey)
  const currentLabel = weekCode ? getPeriodLabel(weekCode) : getPeriodLabel(monthCode)

  function handleConfirm() {
    advance.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(`Window advanced: ${result.from} → ${result.to}`, {
          description:
            result.timesheetsCreated > 0
              ? `Provisioned ${result.timesheetsCreated} timesheet(s) (${result.taskTimesheetsCreated} entries)`
              : 'No new timesheets needed',
        })
      },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={advance.isPending}
        title={`Open week: ${currentLabel}`}
        className="gap-1.5"
      >
        <FastForward size={14} />
        <span className="text-xs tabular-nums">{currentLabel}</span>
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Advance the global open week?"
        description={`Current open week is ${currentLabel}. Advancing shifts every employee's open timesheet forward — current week's timesheets must all be SUBMITTED or APPROVED.`}
        confirmLabel="Advance"
        onConfirm={handleConfirm}
      />
    </>
  )
}
