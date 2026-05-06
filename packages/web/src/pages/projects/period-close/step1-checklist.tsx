import { useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WarningButton } from '@/components/shared/button-adapters'
import { AlertBanner } from '@/components/shared/alert-banner'
import { ColorValue } from '@/components/shared/color-value'
import { StatusItem } from '@/components/shared/status-item'
import { MutedText } from '@/components/shared/muted-text'
import { FlexEnd } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import type { Period, TimesheetEntry, WorkTableCell } from '@/api/types'
import { Step1PlanActualTable } from './step1-plan-actual-table'

function InlineNote({ children }: { children: ReactNode }) {
  return <span style={{ marginLeft: '0.25rem', color: '#6b7280' }}>{children}</span>
}

function SuccessNote({ children }: { children: ReactNode }) {
  return <p style={{ color: '#15803d' }}>{children}</p>
}

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
    <VStack gap="xl">
      <MutedText>
        Review the checklist before closing Period {period.periodNumber} ({period.startDate} – {period.endDate}).
      </MutedText>

      <Card variant="muted">
        <StatusItem
          icon={allApproved
            ? <CheckCircle2 size={20} color="#16a34a" />
            : <XCircle size={20} color="#ef4444" />}
          title="All timesheets approved"
          description={
            <p>
              <ColorValue value={`${approved}/${total} approved`} sentiment={allApproved ? 'positive' : 'negative'} />
              {!allApproved && (
                <InlineNote>
                  ({periodTimesheets
                    .filter((t) => t.status !== 'APPROVED')
                    .map((t) => `${getEmployeeName(t.employeeId)} (${t.status})`)
                    .join(', ')})
                </InlineNote>
              )}
            </p>
          }
        />
        <StatusItem
          icon={<CheckCircle2 size={20} color="#16a34a" />}
          title="Scope additions this period"
          description={<SuccessNote>None</SuccessNote>}
        />
      </Card>

      <Step1PlanActualTable periodNumber={period.periodNumber} rows={planActualRows} />

      {!allApproved && (
        <AlertBanner
          variant="warning"
          icon={<AlertTriangle size={20} color="#d97706" />}
          title="Timesheets not fully approved"
          description="Normally you cannot close this period until all timesheets are approved. For this mockup, you can still proceed."
        />
      )}

      <FlexEnd>
        {allApproved ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <WarningButton onClick={handleNext}>
            Next (bypass warning)
            <ChevronRight size={16} />
          </WarningButton>
        )}
      </FlexEnd>
    </VStack>
  )
}
