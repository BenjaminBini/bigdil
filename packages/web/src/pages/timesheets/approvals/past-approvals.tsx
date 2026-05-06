import { ChevronDown, ChevronRight, Lock } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TdRight, TdSecondary } from '@/components/shared/table-cells'
import { HeadCell } from '@/components/shared/head-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { ColorValue } from '@/components/shared/color-value'
import { CardTitleBar } from '@/components/shared/card-title-bar'
import { InlineStack } from '@/components/shared/inline-stack'
import { formatCurrency } from '@/lib/format'
import type { ReactNode } from 'react'
import type { PastPeriodSummary } from './types'

function CollapsibleBody({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}

interface PastApprovalsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: PastPeriodSummary[]
}

export function PastApprovals({ open, onOpenChange, rows }: PastApprovalsProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Past Approvals ({rows.length})
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CollapsibleBody>
        <Card variant="flush">
          <CardTitleBar title="Frozen Periods - All Approved" />

          <Table variant="compact">
            <TableHeader>
              <TableRow variant="header">
                <HeadCell label="Period" />
                <HeadCell label="Entries" align="right" />
                <HeadCell label="Approved" align="right" />
                <HeadCell label="Total Cost" align="right" />
                <HeadCell label="Status" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.periodId}>
                  <TdSecondary bold>{row.periodId}</TdSecondary>
                  <TdRight>{row.totalEntries}</TdRight>
                  <TdRight>
                    <ColorValue value={row.approvedEntries} sentiment="positive" />
                  </TdRight>
                  <TdRight>
                    {row.totalCost > 0 ? formatCurrency(row.totalCost) : '—'}
                  </TdRight>
                  <TableCell>
                    <InlineStack>
                      <Lock size={12} color="#9ca3af" />
                      <StatusBadge status="APPROVED" />
                    </InlineStack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        </CollapsibleBody>
      </CollapsibleContent>
    </Collapsible>
  )
}