import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProject, useProjectTimesheets, useWorkTable, useReferenceData } from '@/api/hooks'
import type { WorkTableCell, Quote } from '@/api/types'
import type { ForecastRow } from './period-close/types'
import { StepIndicator } from './period-close/step-indicator'
import { Step1Checklist } from './period-close/step1-checklist'
import { Step2Reforecast } from './period-close/step2-reforecast'
import { Step3Preview } from './period-close/step3-preview'
import { Step4Confirm } from './period-close/step4-confirm'

interface PeriodCloseWizardProps {
  open: boolean
  onClose: () => void
  projectId: string
}

function buildForecastRows(workRows: WorkTableCell[]): ForecastRow[] {
  const map = new Map<string, ForecastRow>()
  workRows.forEach((r) => {
    const key = `${r.taskId}|${r.profileId}|${r.employeeId ?? 'unassigned'}`
    if (!map.has(key)) {
      map.set(key, { key, taskId: r.taskId, profileId: r.profileId, employeeId: r.employeeId, periodDays: {} })
    }
    map.get(key)!.periodDays[r.periodId] = r.days
  })
  return Array.from(map.values())
}

export default function PeriodCloseWizard({ open, onClose, projectId }: PeriodCloseWizardProps) {
  const [step, setStep] = useState(1)

  const { data: project } = useProject(projectId)
  const { data: timesheets } = useProjectTimesheets(projectId)
  const { data: workTableData } = useWorkTable(projectId)
  const { data: refData } = useReferenceData()

  function reset() {
    setStep(1)
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      reset()
      onClose()
    }
  }

  const consolidationPeriod = project?.periods.find((p) => p.status === 'CONSOLIDATION')
  const isReady = project && timesheets && workTableData && refData && consolidationPeriod

  const getTaskName = (taskId: string) => project?.flatTasks.find(t => t.id === taskId)?.name ?? taskId
  const getEmployeeName = (employeeId: string) => refData?.employees.find(e => e.id === employeeId)?.name ?? employeeId

  const periodTimesheets = isReady
    ? timesheets.filter((t) => t.periodId === consolidationPeriod.id)
    : []
  const futurePeriods = isReady
    ? project.periods.filter((p) => p.periodNumber > consolidationPeriod.periodNumber && p.status === 'FUTURE')
    : []
  const futurePeriodIds = new Set(futurePeriods.map((p) => p.id))
  const futureWorkRows = isReady
    ? workTableData.cells.filter((r) => futurePeriodIds.has(r.periodId))
    : []

  const forecastRowsInit = buildForecastRows(futureWorkRows)
  const quotedDays = isReady
    ? (project.quotes as Quote[]).flatMap((q) => q.lines).reduce((s, l) => s + l.days, 0)
    : 0

  const stepTitles: Record<number, string> = {
    1: consolidationPeriod ? `Close Period ${consolidationPeriod.periodNumber} — Checklist` : 'Close Period — Checklist',
    2: 'Re-forecast Future Periods',
    3: 'Snapshot Preview',
    4: 'Confirm Period Close',
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <StepIndicator current={step} />
        </div>

        <div className="mt-2">
          {!isReady ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading period data…</div>
          ) : (
            <>
              {step === 1 && (
                <Step1Checklist
                  period={consolidationPeriod}
                  periodTimesheets={periodTimesheets}
                  workTable={workTableData.cells}
                  getEmployeeName={getEmployeeName}
                  getTaskName={getTaskName}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <Step2Reforecast
                  futurePeriods={futurePeriods}
                  forecastRowsInit={forecastRowsInit}
                  quotedDays={quotedDays}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && <Step3Preview onBack={() => setStep(2)} onNext={() => setStep(4)} />}
              {step === 4 && (
                <Step4Confirm
                  period={consolidationPeriod}
                  onBack={() => setStep(3)}
                  onClose={() => {
                    reset()
                    onClose()
                  }}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
