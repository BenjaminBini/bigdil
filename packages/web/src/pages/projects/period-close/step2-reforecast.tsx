import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { TdDetail } from '@/components/shared/table-cells'
import { MetricStrip } from '@/components/shared/metric-strip'
import { CompactInput } from '@/components/shared/compact-input'
import { ColorValue } from '@/components/shared/color-value'
import { MutedText } from '@/components/shared/muted-text'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import type { Period } from '@/api/types'
import type { ForecastRow } from './types'

interface Step2Props {
  futurePeriods: Period[]
  forecastRowsInit: ForecastRow[]
  quotedDays: number
  onBack: () => void
  onNext: () => void
}

export function Step2Reforecast({
  futurePeriods,
  forecastRowsInit,
  quotedDays,
  onBack,
  onNext,
}: Step2Props) {
  const displayPeriods = futurePeriods.slice(0, 5)
  const displayPeriodIds = displayPeriods.map((p) => p.id)

  const [cells, setCells] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    forecastRowsInit.forEach((row) => {
      displayPeriodIds.forEach((pid) => {
        const val = row.periodDays[pid]
        init[`${row.key}|${pid}`] = val != null ? String(val) : ''
      })
    })
    return init
  })

  function totalPlanned(): number {
    return Object.values(cells).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  }

  const total = totalPlanned()
  const variance = total - quotedDays
  const visibleRows = forecastRowsInit.filter((row) =>
    displayPeriodIds.some((pid) => (row.periodDays[pid] ?? 0) > 0),
  )

  return (
    <VStack gap="xl">
      <MutedText>
        Review and adjust the forecast for future periods. Showing up to 5 future periods.
      </MutedText>

      <Card variant="flush">
        <Table variant="compact">
          <TableHeader>
            <TableRow variant="header">
              <HeadCell variant="compact" label="Task" width="140px" />
              <HeadCell variant="compact" label="Profile" width="130px" />
              <HeadCell variant="compact" label="Employee" width="130px" />
              {displayPeriods.map((p) => (
                <HeadCell key={p.id} variant="compact" label={`P${p.periodNumber}`} align="center" width="72px" />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow key={row.key}>
                <TdDetail>{row.taskId}</TdDetail>
                <TdDetail>{row.profileId}</TdDetail>
                <TdDetail>{row.employeeId ?? '—'}</TdDetail>
                {displayPeriodIds.map((pid) => {
                  const cellKey = `${row.key}|${pid}`
                  return (
                    <TableCell key={pid} align="center" className="px-1 py-1">
                      <CompactInput
                        value={cells[cellKey] ?? ''}
                        onChange={(e) =>
                          setCells((prev) => ({ ...prev, [cellKey]: e.target.value }))
                        }
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card variant="muted">
        <MetricStrip
          items={[
            {
              label: 'Total planned',
              value: <ColorValue value={`${total.toFixed(2)} days`} sentiment="neutral" />,
            },
            {
              label: 'Quoted',
              value: <ColorValue value={`${quotedDays} days`} sentiment="neutral" />,
            },
            {
              label: 'Variance',
              value: (
                <ColorValue
                  value={`${variance >= 0 ? '+' : ''}${variance.toFixed(2)} days`}
                  sentiment={variance > 0 ? 'warning' : variance < 0 ? 'positive' : 'neutral'}
                />
              ),
            },
          ]}
        />
      </Card>

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
