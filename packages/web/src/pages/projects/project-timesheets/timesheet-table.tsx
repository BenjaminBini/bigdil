import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ColorValue } from '@/components/shared/color-value'
import { formatCurrency, formatDaysWithUnit } from '@/lib/format'
import { formatDelta, type TimesheetRow } from './model'

interface TimesheetTableProps {
  rows: TimesheetRow[]
  totalPlanned: number
  totalActual: number
  totalCost: number
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
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
    <Card variant="flush">
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
                      <StatusBadge status={row.periodStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-900">{row.employeeName}</TableCell>
                  <TableCell className="py-3 text-gray-700 text-sm">{getTaskName(row.taskId)}</TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">{getProfileName(row.profileId)}</TableCell>
                  <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.plannedDays)}</TableCell>
                  <TableCell className="py-3 text-right text-gray-700">{formatDaysWithUnit(row.actualDays)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <ColorValue
                      value={formatDelta(delta)}
                      sentiment={Math.abs(delta) === 0 ? 'positive' : Math.abs(delta) < 1 ? 'warning' : 'negative'}
                    />
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
                    <StatusBadge status={row.status} />
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
              <TableCell className="py-3 text-right">
                <ColorValue
                  value={formatDelta(totalActual - totalPlanned)}
                  sentiment={Math.abs(totalActual - totalPlanned) === 0 ? 'positive' : Math.abs(totalActual - totalPlanned) < 1 ? 'warning' : 'negative'}
                />
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
    </Card>
  )
}
