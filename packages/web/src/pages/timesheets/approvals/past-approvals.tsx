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
import { timesheetStatusColors } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import type { PastPeriodSummary } from './types'

interface PastApprovalsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: PastPeriodSummary[]
}

export function PastApprovals({ open, onOpenChange, rows }: PastApprovalsProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          Past Approvals ({rows.length})
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 overflow-hidden rounded-lg border bg-white shadow-xs">
          <div className="border-b bg-gray-50 px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-700">Frozen Periods - All Approved</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <HeadCell label="Period" />
                <HeadCell label="Entries" className="text-right" />
                <HeadCell label="Approved" className="text-right" />
                <HeadCell label="Total Cost" className="text-right" />
                <HeadCell label="Status" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.periodId} className="text-sm">
                  <TableCell className="py-2.5 font-medium text-gray-700">{row.periodId}</TableCell>
                  <TableCell className="py-2.5 text-right text-gray-700">{row.totalEntries}</TableCell>
                  <TableCell className="py-2.5 text-right font-medium text-green-700">{row.approvedEntries}</TableCell>
                  <TableCell className="py-2.5 text-right text-gray-700">
                    {row.totalCost > 0 ? formatCurrency(row.totalCost) : '—'}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="size-3 text-gray-400" />
                      <Badge className={timesheetStatusColors.APPROVED}>Approved</Badge>
                    </span>
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