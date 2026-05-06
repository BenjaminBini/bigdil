import type { ReactNode } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/shared/kpi-card'
import { KpiGrid, FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { AlertBanner } from '@/components/shared/alert-banner'
import { MutedText } from '@/components/shared/muted-text'
import { formatCurrency } from '@/lib/format'

function FormulaLine({ children }: { children: ReactNode }) {
  return <p className="text-blue-700 font-mono text-xs">{children}</p>
}

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
    <VStack gap="xl">
      <MutedText>
        Review the snapshot metrics that will be recorded when this period is closed.
      </MutedText>

      <AlertBanner variant="info" title="Execution value formula" size="compact">
        <FormulaLine>
          Executed Days = (R0 + S_add − R1) ÷ avg. sell rate
          = ({formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}) ÷ {PREVIEW.revenuePerDay}
          = <strong>{executedDays.toFixed(2)} days</strong>
        </FormulaLine>
        <FormulaLine>
          Produced Execution Value = {formatCurrency(PREVIEW.r0)} + {formatCurrency(PREVIEW.sAdd)} − {formatCurrency(PREVIEW.r1)}
          = <strong>{formatCurrency(producedValue)}</strong>
        </FormulaLine>
      </AlertBanner>

      <KpiGrid>
        <KpiCard label="R0 (remaining at prev. close)" value={formatCurrency(PREVIEW.r0)} description="Contract − produced to date" />
        <KpiCard label="S_add (scope additions)" value={formatCurrency(PREVIEW.sAdd)} description="No scope additions" />
        <KpiCard label="R1 (remaining after period)" value={formatCurrency(PREVIEW.r1)} description="Re-forecasted remaining" />
        <KpiCard label="Executed Days (period)" value={`${executedDays.toFixed(2)} days`} description="(R0 + S_add − R1) ÷ sell rate" />
      </KpiGrid>

      <KpiGrid>
        <KpiCard label="Produced Exec. Value" value={formatCurrency(producedValue)} variant="highlight" />
        <KpiCard label="Contract Value" value={formatCurrency(PREVIEW.contractValue)} />
        <KpiCard label="Actual Cost to Date" value={formatCurrency(PREVIEW.actualCostToDate)} description="Incl. approved timesheets" />
        <KpiCard label="ETC Cost" value={formatCurrency(PREVIEW.etcCost)} description="Forecast remaining cost" />
      </KpiGrid>

      <KpiGrid>
        <KpiCard label="EAC Cost" value={formatCurrency(PREVIEW.eacCost)} description="Actual + ETC" />
        <KpiCard
          label="Margin Forecast"
          value={formatCurrency(PREVIEW.marginForecast)}
          description={`${PREVIEW.marginPct.toFixed(1)}% of contract`}
          variant="highlight"
        />
      </KpiGrid>

      <AlertBanner
        variant="warning"
        icon={<AlertTriangle size={20} color="#d97706" />}
        title="Some timesheets may not be approved"
        description="Actuals for this snapshot are based on currently available approved data. Cost may change if pending timesheets are approved retroactively."
      />

      <FlexBetween>
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft size={16} />
          Back
        </Button>
        <Button onClick={onNext}>
          Next
          <ChevronRight size={16} />
        </Button>
      </FlexBetween>
    </VStack>
  )
}
