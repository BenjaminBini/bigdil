import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
        <div className="flex items-start gap-3 p-4">
          {allApproved ? (
            <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">All timesheets approved</p>
            <p className={cn('text-xs mt-0.5', allApproved ? 'text-green-700' : 'text-red-600')}>
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
          </div>
        </div>

        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Scope additions this period</p>
            <p className="text-xs text-green-700 mt-0.5">None</p>
          </div>
        </div>
      </div>

      <Step1PlanActualTable periodNumber={period.periodNumber} rows={planActualRows} />

      {!allApproved && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Timesheets not fully approved</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Normally you cannot close this period until all timesheets are approved.
              For this mockup, you can still proceed.
            </p>
          </div>
        </div>
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
