import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/shared/kpi-card'
import { AlertBanner } from '@/components/shared/alert-banner'
import { formatCurrency } from '@/lib/format'

const PREVIEW = {
  r0: 102325,
  sAdd: 0,
  r1: 94975,
  contractValue: 127750,
  actualCostToDate: 20550,
  etcCost: 43280,
  eacCost: 63830,
  marginForecast: 63920,
  marginPct: 50.0,
  revenuePerDay: 1200,
}

const executedDays = (PREVIEW.r0 + PREVIEW.sAdd - PREVIEW.r1) / PREVIEW.revenuePerDay
const producedValue = PREVIEW.r0 + PREVIEW.sAdd - PREVIEW.r1

export function Step3Preview({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Review the snapshot metrics that will be recorded when this period is closed.
      </p>

      <AlertBanner variant="info" title="Execution value formula" className="px-4 py-3 text-sm">
        <p className="text-blue-700 font-mono text-xs">
          Executed Days = (R0 + S_add − R1) ÷ avg. sell rate
          = ({formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}) ÷ {PREVIEW.revenuePerDay}
          = <strong>{executedDays.toFixed(2)} days</strong>
        </p>
        <p className="text-blue-700 font-mono text-xs mt-1">
          Produced Execution Value = {formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}
          = <strong>{formatCurrency(producedValue)}</strong>
        </p>
      </AlertBanner>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="R0 (remaining at prev. close)" value={formatCurrency(PREVIEW.r0)} description="Contract − produced to date" />
        <KpiCard label="S_add (scope additions)" value={formatCurrency(PREVIEW.sAdd)} description="No scope additions" />
        <KpiCard label="R1 (remaining after period)" value={formatCurrency(PREVIEW.r1)} description="Re-forecasted remaining" />
        <KpiCard label="Executed Days (period)" value={`${executedDays.toFixed(2)} days`} description="(R0 + S_add − R1) ÷ sell rate" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Produced Exec. Value" value={formatCurrency(producedValue)} variant="highlight" />
        <KpiCard label="Contract Value" value={formatCurrency(PREVIEW.contractValue)} />
        <KpiCard label="Actual Cost to Date" value={formatCurrency(PREVIEW.actualCostToDate)} description="Incl. approved timesheets" />
        <KpiCard label="ETC Cost" value={formatCurrency(PREVIEW.etcCost)} description="Forecast remaining cost" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="EAC Cost" value={formatCurrency(PREVIEW.eacCost)} description="Actual + ETC" />
        <KpiCard
          label="Margin Forecast"
          value={formatCurrency(PREVIEW.marginForecast)}
          description={`${PREVIEW.marginPct.toFixed(1)}% of contract`}
          variant="highlight"
        />
      </div>

      <AlertBanner
        variant="warning"
        icon={<AlertTriangle className="size-5 text-amber-600" />}
        title="Some timesheets may not be approved"
        description="Actuals for this snapshot are based on currently available approved data. Cost may change if pending timesheets are approved retroactively."
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
