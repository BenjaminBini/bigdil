import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { TdPrimary, TdNumeric, TdDetail, TdNumericLight, TdNumericPrimary, ThRight } from '@/components/shared/table-cells'
import { EmptyRow } from '@/components/shared/empty-row'
import { MetricStrip, MetricValue } from '@/components/shared/metric-strip'
import { FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { SectionTitle } from '@/components/shared/page-title'
import { formatCurrency, formatDays } from '@/lib/format'
import type { Snapshot, TimesheetEntry } from '@/api/types'
import { comparePeriodSliceKeys } from '@/lib/period-utils'

interface ActualsTabProps {
  snapshot: Snapshot
  allTimesheets: TimesheetEntry[]
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
  getEmployeeName: (id: string) => string
}

export function ActualsTab({
  snapshot,
  allTimesheets,
  getTaskName,
  getProfileName,
  getEmployeeName,
}: ActualsTabProps) {
  const periodCode = snapshot.periodCode

  const periodActuals = allTimesheets.filter(
    (t) => t.periodCode === periodCode && t.status === 'APPROVED',
  )

  const closedPeriodCodes = new Set(
    snapshot.workTableRows
      .filter(r => comparePeriodSliceKeys(r.periodCode, periodCode) <= 0)
      .map(r => r.periodCode),
  )
  const cumulativeActuals = allTimesheets.filter(
    (t) => closedPeriodCodes.has(t.periodCode) && t.status === 'APPROVED',
  )

  function renderRows(entries: TimesheetEntry[]) {
    if (entries.length === 0) {
      return (
        <EmptyRow colSpan={8} message="No approved timesheets" />
      )
    }
    return entries.map((entry) => (
      <TableRow key={entry.id} variant="interactive">
        <TdPrimary size="sm">
          {getEmployeeName(entry.employeeId)}
        </TdPrimary>
        <TdDetail>{getTaskName(entry.taskId)}</TdDetail>
        <TdDetail>{getProfileName(entry.profileId)}</TdDetail>
        <TdNumeric>{formatDays(entry.days)}</TdNumeric>
        <TdNumericLight>
          {entry.appliedCostRatePerDay != null ? formatCurrency(entry.appliedCostRatePerDay) : '—'}
        </TdNumericLight>
        <TdNumericPrimary>
          {entry.appliedCostAmount != null ? formatCurrency(entry.appliedCostAmount) : '—'}
        </TdNumericPrimary>
        <TdNumericLight>
          {entry.appliedSellRatePerDay != null ? formatCurrency(entry.appliedSellRatePerDay) : '—'}
        </TdNumericLight>
        <TdNumericPrimary>
          {entry.appliedSellAmount != null ? formatCurrency(entry.appliedSellAmount) : '—'}
        </TdNumericPrimary>
      </TableRow>
    ))
  }

  const periodCost = periodActuals.reduce((s, t) => s + (t.appliedCostAmount ?? 0), 0)
  const periodSell = periodActuals.reduce((s, t) => s + (t.appliedSellAmount ?? 0), 0)
  const cumCost = cumulativeActuals.reduce((s, t) => s + (t.appliedCostAmount ?? 0), 0)
  const cumSell = cumulativeActuals.reduce((s, t) => s + (t.appliedSellAmount ?? 0), 0)

  const colHeaders = (
    <TableRow variant="header">
      <TableHead>Employee</TableHead>
      <TableHead>Task</TableHead>
      <TableHead>Profile</TableHead>
      <ThRight>Days</ThRight>
      <ThRight>Cost Rate/day</ThRight>
      <ThRight>Cost Amount</ThRight>
      <ThRight>Sell Rate/day</ThRight>
      <ThRight>Sell Amount</ThRight>
    </TableRow>
  )

  return (
    <VStack gap="xl" pt="md">
      <VStack>
        <FlexBetween>
          <SectionTitle>{snapshot.periodCode} — Approved Timesheets</SectionTitle>
          <MetricStrip items={[
            { label: 'Cost', value: <MetricValue>{formatCurrency(periodCost)}</MetricValue> },
            { label: 'Sell', value: <MetricValue>{formatCurrency(periodSell)}</MetricValue> },
          ]} />
        </FlexBetween>
        <Card variant="flush">
          <Table>
            <TableHeader>{colHeaders}</TableHeader>
            <TableBody>{renderRows(periodActuals)}</TableBody>
          </Table>
        </Card>
      </VStack>

      <VStack>
        <FlexBetween>
          <SectionTitle>Cumulative — up to {snapshot.periodCode}</SectionTitle>
          <MetricStrip items={[
            { label: 'Cost', value: <MetricValue>{formatCurrency(cumCost)}</MetricValue> },
            { label: 'Sell', value: <MetricValue>{formatCurrency(cumSell)}</MetricValue> },
          ]} />
        </FlexBetween>
        <Card variant="flush">
          <Table>
            <TableHeader>{colHeaders}</TableHeader>
            <TableBody>{renderRows(cumulativeActuals)}</TableBody>
          </Table>
        </Card>
      </VStack>
    </VStack>
  )
}
