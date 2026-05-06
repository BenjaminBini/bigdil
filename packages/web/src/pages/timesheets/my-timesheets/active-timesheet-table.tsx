import { Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TdPrimary, TdNumeric, TdDetail, TdRight, TdNumericPrimary } from '@/components/shared/table-cells'
import { HeadCell } from '@/components/shared/head-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { formatDays, formatDaysWithUnit } from '@/lib/format'
import { CardTitleBar, CardFooterBar } from '@/components/shared/card-title-bar'
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
    <Card variant="flush">
      <CardTitleBar
        title={projectName}
        subtitle="Active period"
        actions={<StatusBadge status="OPEN" />}
      />

      <Table variant="compact">
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Task" />
            <HeadCell label="Profile" />
            <HeadCell label="Planned Days" align="right" width="112px" />
            <HeadCell label="Actual Days" align="right" width="128px" />
            <HeadCell label="Status" width="96px" />
            <HeadCell label="Notes" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="align-top">
              <TdPrimary>{getTaskName(row.taskId)}</TdPrimary>
              <TdDetail>{getProfileName(row.profileId)}</TdDetail>
              <TdNumeric>{formatDays(row.plannedDays)}</TdNumeric>
              <TdRight>
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
              </TdRight>
              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell>
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

          <TableRow variant="total">
            <TdPrimary colSpan={2}>
              Total
            </TdPrimary>
            <TdNumericPrimary>{formatDaysWithUnit(totalPlanned)}</TdNumericPrimary>
            <TdNumericPrimary className="pr-4">{formatDaysWithUnit(totalActual)}</TdNumericPrimary>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <CardFooterBar align="end">
        <Button variant="outline" size="sm" onClick={onSaveDraft}>
          <Save size={14} />
          Save Draft
        </Button>
        <Button size="sm" onClick={onSubmit}>
          <Send size={14} />
          Submit
        </Button>
      </CardFooterBar>
    </Card>
  )
}
