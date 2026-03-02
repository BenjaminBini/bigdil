import { Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { formatDays, formatDaysWithUnit } from '@/lib/format'
import type { EntryRowState } from './types'

interface ActiveTimesheetTableProps {
  projectName: string
  rows: EntryRowState[]
  totalPlanned: number
  totalActual: number
  onUpdateRow: (id: string, field: 'actualDays' | 'notes', value: string | number) => void
  onSaveDraft: () => void
  onSubmit: () => void
  getTaskName: (taskId: string) => string
  getProfileName: (profileId: string) => string
}

export function ActiveTimesheetTable({
  projectName,
  rows,
  totalPlanned,
  totalActual,
  onUpdateRow,
  onSaveDraft,
  onSubmit,
  getTaskName,
  getProfileName,
}: ActiveTimesheetTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
      <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">{projectName}</h2>
          <p className="mt-0.5 text-xs text-gray-500">Active period</p>
        </div>
        <StatusBadge status="OPEN" />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            <HeadCell label="Planned Days" className="w-28 text-right" />
            <HeadCell label="Actual Days" className="w-32 text-right" />
            <HeadCell label="Status" className="w-24" />
            <HeadCell label="Notes" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="align-top">
              <TableCell className="py-3 font-medium text-gray-900">{getTaskName(row.taskId)}</TableCell>
              <TableCell className="py-3 text-sm text-gray-600">{getProfileName(row.profileId)}</TableCell>
              <TableCell className="py-3 text-right text-gray-700">{formatDays(row.plannedDays)}</TableCell>
              <TableCell className="py-2 text-right">
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.25}
                  value={row.actualDays}
                  onChange={(e) => onUpdateRow(row.id, 'actualDays', e.target.value)}
                  size="sm"
                  className="ml-auto w-24 text-right"
                />
              </TableCell>
              <TableCell className="py-3">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell className="py-2">
                <Textarea
                  value={row.notes}
                  onChange={(e) => onUpdateRow(row.id, 'notes', e.target.value)}
                  placeholder="Optional notes…"
                  rows={1}
                  className="min-h-8 resize-none py-1.5 text-sm"
                />
              </TableCell>
            </TableRow>
          ))}

          <TableRow className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
            <TableCell className="py-3 text-gray-900" colSpan={2}>
              Total
            </TableCell>
            <TableCell className="py-3 text-right text-gray-900">{formatDaysWithUnit(totalPlanned)}</TableCell>
            <TableCell className="py-3 pr-4 text-right text-gray-900">{formatDaysWithUnit(totalActual)}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-5 py-3">
        <Button variant="outline" size="sm" onClick={onSaveDraft}>
          <Save className="size-3.5" />
          Save Draft
        </Button>
        <Button size="sm" onClick={onSubmit}>
          <Send className="size-3.5" />
          Submit
        </Button>
      </div>
    </div>
  )
}