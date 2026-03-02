import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MetricStrip } from '@/components/shared/metric-strip'
import { CompactInput } from '@/components/shared/compact-input'
import { ColorValue } from '@/components/shared/color-value'
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
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Review and adjust the forecast for future periods. Showing up to 5 future periods.
      </p>

      <Card variant="flush" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 min-w-[140px]">Task</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 min-w-[130px]">Profile</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 min-w-[130px]">Employee</th>
              {displayPeriods.map((p) => (
                <th key={p.id} className="px-2 py-2.5 text-center font-medium text-gray-600 min-w-[72px]">
                  P{p.periodNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.key} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-700 text-xs">{row.taskId}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{row.profileId}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{row.employeeId ?? '—'}</td>
                {displayPeriodIds.map((pid) => {
                  const cellKey = `${row.key}|${pid}`
                  return (
                    <td key={pid} className="px-1 py-1 text-center">
                      <CompactInput
                        value={cells[cellKey] ?? ''}
                        onChange={(e) =>
                          setCells((prev) => ({ ...prev, [cellKey]: e.target.value }))
                        }
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <MetricStrip
        className="rounded-lg border bg-gray-50 px-4 py-3"
        items={[
          {
            label: 'Total planned',
            value: <span className="font-semibold text-gray-900 tabular-nums">{total.toFixed(2)} days</span>,
          },
          {
            label: 'Quoted',
            value: <span className="font-semibold text-gray-900 tabular-nums">{quotedDays} days</span>,
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
