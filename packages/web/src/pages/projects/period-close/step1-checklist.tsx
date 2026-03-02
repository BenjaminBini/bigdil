import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertBanner } from '@/components/shared/alert-banner'
import { StatusItem } from '@/components/shared/status-item'
import type { Period, TimesheetEntry, WorkTableCell } from '@/api/types'
import { Step1PlanActualTable } from './step1-plan-actual-table'

interface Step1Props {
  period: Period
  periodTimesheets: TimesheetEntry[]
  workTable: WorkTableCell[]
  getEmployeeName: (id: string) => string
  getTaskName: (id: string) => string
  onNext: () => void
}

export function Step1Checklist({
  period,
  periodTimesheets,
  workTable,
  getEmployeeName,
  getTaskName,
  onNext,
}: Step1Props) {
  const [warningDismissed, setWarningDismissed] = useState(false)

  const approved = periodTimesheets.filter((t) => t.status === 'APPROVED').length
  const total = periodTimesheets.length
  const allApproved = approved === total

  const planActualRows = periodTimesheets.map((ts) => {
    const planned = workTable.find(
      (w) => w.periodId === ts.periodId && w.taskId === ts.taskId && w.profileId === ts.profileId,
    )
    return {
      id: ts.id,
      employee: getEmployeeName(ts.employeeId),
      task: getTaskName(ts.taskId),
      plannedDays: planned?.days ?? 0,
      actualDays: ts.days,
      status: ts.status,
    }
  })

  function handleNext() {
    if (!allApproved && !warningDismissed) {
      setWarningDismissed(true)
      toast.warning('Not all timesheets approved — proceeding anyway for mockup purposes')
    }
    onNext()
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Review the checklist before closing Period {period.periodNumber} ({period.startDate} – {period.endDate}).
      </p>

      <div className="rounded-lg border bg-gray-50 divide-y">
        <StatusItem
          icon={allApproved
            ? <CheckCircle2 className="size-5 text-green-600" />
            : <XCircle className="size-5 text-red-500" />}
          title="All timesheets approved"
          description={
            <p className={cn(allApproved ? 'text-green-700' : 'text-red-600')}>
              {approved}/{total} approved
              {!allApproved && (
                <span className="ml-1 text-gray-500">
                  ({periodTimesheets
                    .filter((t) => t.status !== 'APPROVED')
                    .map((t) => `${getEmployeeName(t.employeeId)} (${t.status})`)
                    .join(', ')})
                </span>
              )}
            </p>
          }
        />
        <StatusItem
          icon={<CheckCircle2 className="size-5 text-green-600" />}
          title="Scope additions this period"
          description={<p className="text-green-700">None</p>}
        />
      </div>

      <Step1PlanActualTable periodNumber={period.periodNumber} rows={planActualRows} />

      {!allApproved && (
        <AlertBanner
          variant="warning"
          icon={<AlertTriangle className="size-5 text-amber-600" />}
          title="Timesheets not fully approved"
          description="Normally you cannot close this period until all timesheets are approved. For this mockup, you can still proceed."
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className={cn(allApproved ? 'bg-gray-900 hover:bg-gray-800' : 'bg-amber-600 hover:bg-amber-700')}
        >
          {allApproved ? 'Next' : 'Next (bypass warning)'}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
