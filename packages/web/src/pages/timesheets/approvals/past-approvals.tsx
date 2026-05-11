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
import { TdPrimary, TdNumeric, TdDetail } from '@/components/shared/table-cells'
import { HeadCell } from '@/components/shared/head-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardTitleBar } from '@/components/shared/card-title-bar'
import { formatDaysWithUnit } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatPeriodSliceLabel } from '@/lib/period-utils'
import type { ReactNode } from 'react'
import type { Timesheet } from '@/api/types'
import { TimesheetDetail } from '../shared/timesheet-detail'

function CollapsibleBody({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}

interface PastApprovalsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timesheets: Timesheet[]
  getEmployeeName: (id: string) => string
}

export function PastApprovals({ open, onOpenChange, timesheets, getEmployeeName }: PastApprovalsProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 6 cols: chevron + employee + period + entries + total + status
  const colSpan = 5

  if (timesheets.length === 0) return null

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <ChevronRight
            size={16}
            className={cn('transition-transform duration-200 ease-out', open && 'rotate-90')}
          />
          {t('pages:approvals.pastApprovals', { count: timesheets.length })}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CollapsibleBody>
          <Card variant="flush">
            <CardTitleBar title={t('pages:approvals.frozenAllApproved')} />

            <Table variant="compact">
              <TableHeader>
                <TableRow variant="header">
                  <HeadCell label="" width="32px" />
                  <HeadCell label="Employee" />
                  <HeadCell label="Period" />
                  <HeadCell label="Total Days" align="right" width="112px" />
                  <HeadCell label="Status" width="112px" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((ts) => {
                  const isOpen = expanded.has(ts.id)
                  const totalDays =
                    ts.taskTimesheets.reduce((sum, e) => sum + e.days, 0) +
                    (ts.leaveDays ?? []).reduce((sum, l) => sum + l.days, 0)

                  return (
                    <Fragment key={ts.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => toggle(ts.id)}
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
                        <TdPrimary>{getEmployeeName(ts.employeeId)}</TdPrimary>
                        <TdDetail>{formatPeriodSliceLabel(ts.periodKey)}</TdDetail>
                        <TdNumeric>{formatDaysWithUnit(totalDays)}</TdNumeric>
                        <TableCell>
                          <StatusBadge status={ts.status} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={colSpan}
                          className={cn(
                            'border-l-2 bg-muted/10 !p-0',
                            isOpen ? 'border-l-primary/60' : 'border-l-transparent',
                          )}
                        >
                          <div
                            className={cn(
                              'grid transition-[grid-template-rows] duration-200 ease-out',
                              isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                            )}
                          >
                            <div className="overflow-hidden">
                              <TimesheetDetail timesheet={ts} />
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
