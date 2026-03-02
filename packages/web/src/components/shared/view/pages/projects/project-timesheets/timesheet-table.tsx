/* eslint-disable max-lines */
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { timesheetStatusColors, timesheetStatusLabels } from '@/lib/constants'
import { formatCurrency, formatDaysWithUnit } from '@/lib/format'
import type { TimesheetStatus } from '@/api/types'

export interface TimesheetRow {
  id: string
  periodId: string
  periodNumber: number
  periodLabel: string
  periodStatus: string
  employeeId: string
  employeeName: string
  taskId: string
  profileId: string
  plannedDays: number
  actualDays: number
  costRate: number | null
  costAmount: number | null
  status: TimesheetStatus
}

interface TimesheetTableProps {
  rows: TimesheetRow[]
  totalPlanned: number
  totalActual: number
  totalCost: number
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
}

function deltaColor(delta: number): string {
  const absoluteDelta = Math.abs(delta)
  if (absoluteDelta === 0) return 'text-green-600'
  if (absoluteDelta < 1) return 'text-amber-600'
  return 'text-red-600'
}

function formatDelta(delta: number): string {
  if (delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatDaysWithUnit(delta)}`
}

export function TimesheetTable({
  rows,
  totalPlanned,
  totalActual,
  totalCost,
  getTaskName,
  getProfileName,
}: TimesheetTableProps) {
  return (
    <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profile</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-28">Planned Days</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-24">Actual Days</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-20">Delta</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-28">Cost Rate</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-28">Cost Amount</TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-400 py-10">
                No timesheets match the current filters
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const delta = row.actualDays - row.plannedDays
              const isLocked = row.periodStatus === 'FROZEN' || row.periodStatus === 'CONSOLIDATION'
              return (
                <TableRow key={row.id} className={isLocked ? '' : 'bg-amber-50/30'}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700 text-sm">{row.periodLabel}</span>
                      {row.periodStatus === 'FROZEN' ? (
                        <Badge className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0">
                          Frozen
                        </Badge>
                      ) : row.periodStatus === 'CONSOLIDATION' ? (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0">
                          Consolidation
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                          Open
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-900">{row.employeeName}</TableCell>
                  <TableCell className="py-3 text-gray-700 text-sm">{getTaskName(row.taskId)}</TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">{getProfileName(row.profileId)}</TableCell>
                  <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.plannedDays)}</TableCell>
                  <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.actualDays)}</TableCell>
                  <TableCell className={['py-3 text-right font-medium tabular-nums', deltaColor(delta)].join(' ')}>
                    {formatDelta(delta)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-gray-700">
                    {row.costRate != null ? (
                      <span className="font-medium">{formatCurrency(row.costRate)}/d</span>
                    ) : (
                      <span className="text-gray-300 text-xs italic">pending</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right text-gray-700">
                    {row.costAmount != null ? (
                      <span className="font-medium">{formatCurrency(row.costAmount)}</span>
                    ) : (
                      <span className="text-gray-300 text-xs italic">pending</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className={timesheetStatusColors[row.status]}>
                      {timesheetStatusLabels[row.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })
          )}

          {rows.length > 0 && (
            <TableRow className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
              <TableCell className="py-3 text-gray-900" colSpan={4}>
                Total ({rows.length} entries)
              </TableCell>
              <TableCell className="py-3 text-right text-gray-900">{formatDaysWithUnit(totalPlanned)}</TableCell>
              <TableCell className="py-3 text-right text-gray-900">{formatDaysWithUnit(totalActual)}</TableCell>
              <TableCell className={['py-3 text-right font-medium tabular-nums', deltaColor(totalActual - totalPlanned)].join(' ')}>
                {formatDelta(totalActual - totalPlanned)}
              </TableCell>
              <TableCell />
              <TableCell className="py-3 text-right text-gray-900">
                {totalCost > 0 ? formatCurrency(totalCost) : '—'}
              </TableCell>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
