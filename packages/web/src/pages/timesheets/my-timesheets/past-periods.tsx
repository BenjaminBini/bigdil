import { ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { timesheetStatusColors, timesheetStatusLabels } from '@/lib/constants'
import { formatCurrency, formatDays } from '@/lib/format'
import type { ClosedPeriodRow } from './types'

interface PastPeriodsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: ClosedPeriodRow[]
}

export function PastPeriods({ open, onOpenChange, rows }: PastPeriodsProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          Past Periods ({rows.length})
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 overflow-hidden rounded-lg border bg-white shadow-xs">
          <div className="border-b bg-gray-50 px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-700">Frozen Periods - Read Only</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <HeadCell label="Period" />
                <HeadCell label="Days Submitted" className="text-right" />
                <HeadCell label="Status" />
                <HeadCell label="Cost Amount" className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.periodId} className="text-sm">
                  <TableCell className="py-2.5 font-medium text-gray-700">{row.label}</TableCell>
                  <TableCell className="py-2.5 text-right text-gray-700">
                    {row.daysSubmitted > 0 ? `${formatDays(row.daysSubmitted)}d` : '—'}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="size-3 text-gray-400" />
                      <Badge className={timesheetStatusColors[row.status]}>
                        {timesheetStatusLabels[row.status]}
                      </Badge>
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-gray-700">
                    {row.costAmount > 0 ? formatCurrency(row.costAmount) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}