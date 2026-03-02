import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

      <div className="rounded-lg border bg-white overflow-x-auto">
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
                      <Input
                        className="h-7 w-14 text-center text-xs px-1 tabular-nums"
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
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">
          Total planned:{' '}
          <span className="font-semibold text-gray-900 tabular-nums">{total.toFixed(2)} days</span>
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          Quoted:{' '}
          <span className="font-semibold text-gray-900 tabular-nums">{quotedDays} days</span>
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          Variance:{' '}
          <span
            className={cn(
              'font-semibold tabular-nums',
              variance > 0 ? 'text-amber-600' : variance < 0 ? 'text-blue-600' : 'text-green-700',
            )}
          >
            {variance >= 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2)} days
          </span>
        </span>
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
