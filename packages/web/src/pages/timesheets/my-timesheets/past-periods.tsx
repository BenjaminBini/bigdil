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
import { HeadCell } from '@/components/shared/head-cell'
import { TdNumeric, TdSecondary } from '@/components/shared/table-cells'
import { StatusBadge } from '@/components/shared/status-badge'
import { InlineStack } from '@/components/shared/inline-stack'
import { formatCurrency, formatDays } from '@/lib/format'
import { CardTitleBar } from '@/components/shared/card-title-bar'
import type { ReactNode } from 'react'
import type { ClosedPeriodRow } from './types'

function CollapsibleBody({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}

interface PastPeriodsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: ClosedPeriodRow[]
}

export function PastPeriods({ open, onOpenChange, rows }: PastPeriodsProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Past Periods ({rows.length})
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CollapsibleBody>
        <Card variant="flush">
          <CardTitleBar title="Frozen Periods - Read Only" />

          <Table variant="compact">
            <TableHeader>
              <TableRow variant="header">
                <HeadCell label="Period" />
                <HeadCell label="Days Submitted" align="right" />
                <HeadCell label="Status" />
                <HeadCell label="Cost Amount" align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.periodId}>
                  <TdSecondary bold>{row.label}</TdSecondary>
                  <TdNumeric>
                    {row.daysSubmitted > 0 ? `${formatDays(row.daysSubmitted)}d` : '—'}
                  </TdNumeric>
                  <TableCell>
                    <InlineStack>
                      <Lock size={12} color="#9ca3af" />
                      <StatusBadge status={row.status} />
                    </InlineStack>
                  </TableCell>
                  <TdNumeric>
                    {row.costAmount > 0 ? formatCurrency(row.costAmount) : '—'}
                  </TdNumeric>
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
