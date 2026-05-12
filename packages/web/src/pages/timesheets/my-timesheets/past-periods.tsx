import { Fragment, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { formatCurrency, formatDays } from '@/lib/format'
import { CardTitleBar } from '@/components/shared/card-title-bar'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TimesheetDetail } from '../shared/timesheet-detail'
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
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(periodCode: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(periodCode)) next.delete(periodCode)
      else next.add(periodCode)
      return next
    })
  }

  // 5 cols: chevron + period + days + status + cost
  const colSpan = 5

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <ChevronRight
            size={16}
            className={cn('transition-transform duration-200 ease-out', open && 'rotate-90')}
          />
          {t('pages:timesheets.pastPeriods', { count: rows.length })}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CollapsibleBody>
        <Card variant="flush">
          <CardTitleBar title={t('pages:timesheets.frozenPeriodsReadOnly')} />

          <Table variant="compact">
            <TableHeader>
              <TableRow variant="header">
                <HeadCell label="" width="32px" />
                <HeadCell label={t('pages:timesheets.table.period')} />
                <HeadCell label={t('pages:timesheets.table.daysSubmitted')} align="right" />
                <HeadCell label={t('pages:timesheets.table.status')} />
                <HeadCell label={t('pages:timesheets.table.costAmount')} align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isOpen = expanded.has(row.periodCode)
                return (
                  <Fragment key={row.periodCode}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => toggle(row.periodCode)}
                    >
                      <TableCell className="w-8 pr-0">
                        <ChevronRight
                          size={14}
                          className={cn(
                            'transition-transform duration-200 ease-out',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </TableCell>
                      <TdSecondary bold>{row.label}</TdSecondary>
                      <TdNumeric>
                        {row.daysSubmitted > 0 ? `${formatDays(row.daysSubmitted)}d` : '—'}
                      </TdNumeric>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TdNumeric>
                        {row.costAmount > 0 ? formatCurrency(row.costAmount) : '—'}
                      </TdNumeric>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={colSpan}
                        className={cn(
                          'border-l-2 border-l-primary/60 bg-muted/10 !p-0',
                          !isOpen && 'border-l-transparent',
                        )}
                      >
                        <div
                          className={cn(
                            'grid transition-[grid-template-rows] duration-200 ease-out',
                            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                          )}
                        >
                          <div className="overflow-hidden">
                            <TimesheetDetail timesheet={row.timesheet} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </Card>
        </CollapsibleBody>
      </CollapsibleContent>
    </Collapsible>
  )
}
