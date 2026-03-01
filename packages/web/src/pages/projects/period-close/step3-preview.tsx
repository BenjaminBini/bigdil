import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  warning?: boolean
}

function MetricCard({ label, value, sub, highlight, warning }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-1',
        highlight && 'border-green-200 bg-green-50',
        warning && 'border-amber-200 bg-amber-50',
        !highlight && !warning && 'bg-white',
      )}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={cn(
          'text-xl font-semibold tabular-nums',
          highlight ? 'text-green-700' : warning ? 'text-amber-700' : 'text-gray-900',
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function Step3Preview({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Review the snapshot metrics that will be recorded when this period is closed.
      </p>

      <div className="rounded-lg border bg-blue-50 border-blue-200 px-4 py-3 text-sm">
        <p className="font-medium text-blue-800 mb-1">Execution value formula</p>
        <p className="text-blue-700 font-mono text-xs">
          Executed Days = (R0 + S_add − R1) ÷ avg. sell rate
          = ({formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}) ÷ {PREVIEW.revenuePerDay}
          = <strong>{executedDays.toFixed(2)} days</strong>
        </p>
        <p className="text-blue-700 font-mono text-xs mt-1">
          Produced Execution Value = {formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}
          = <strong>{formatCurrency(producedValue)}</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="R0 (remaining at prev. close)" value={formatCurrency(PREVIEW.r0)} sub="Contract − produced to date" />
        <MetricCard label="S_add (scope additions)" value={formatCurrency(PREVIEW.sAdd)} sub="No scope additions" />
        <MetricCard label="R1 (remaining after period)" value={formatCurrency(PREVIEW.r1)} sub="Re-forecasted remaining" />
        <MetricCard label="Executed Days (period)" value={`${executedDays.toFixed(2)} days`} sub="(R0 + S_add − R1) ÷ sell rate" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Produced Exec. Value" value={formatCurrency(producedValue)} highlight />
        <MetricCard label="Contract Value" value={formatCurrency(PREVIEW.contractValue)} />
        <MetricCard label="Actual Cost to Date" value={formatCurrency(PREVIEW.actualCostToDate)} sub="Incl. approved timesheets" />
        <MetricCard label="ETC Cost" value={formatCurrency(PREVIEW.etcCost)} sub="Forecast remaining cost" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="EAC Cost" value={formatCurrency(PREVIEW.eacCost)} sub="Actual + ETC" />
        <MetricCard
          label="Margin Forecast"
          value={formatCurrency(PREVIEW.marginForecast)}
          sub={`${PREVIEW.marginPct.toFixed(1)}% of contract`}
          highlight
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Some timesheets may not be approved</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Actuals for this snapshot are based on currently available approved data.
            Cost may change if pending timesheets are approved retroactively.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button className="bg-gray-900 hover:bg-gray-800" onClick={onNext}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
