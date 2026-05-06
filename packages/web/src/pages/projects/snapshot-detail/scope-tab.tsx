import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { TdNumeric, TdDetail, TdNumericLight, TdNumericPrimary, TdRight, ThRight } from '@/components/shared/table-cells'
import { MutedText } from '@/components/shared/muted-text'
import { KpiCard } from '@/components/shared/kpi-card'
import { FlexRow } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { formatCurrency, formatDays } from '@/lib/format'
import type { SnapshotScopeLine } from '@/api/types'

interface ScopeTabProps {
  rows: SnapshotScopeLine[]
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
}

export function ScopeTab({ rows, getTaskName, getProfileName }: ScopeTabProps) {
  const totalRevenue = rows.reduce((s, r) => s + r.baselineRevenueTotal, 0)
  const totalBudgetCost = rows.reduce((s, r) => s + r.baselineBudgetCostTotal, 0)
  const totalDays = rows.reduce((s, r) => s + r.baselineDaysTotalAsofSnapshot, 0)

  return (
    <VStack gap="xl" pt="md">
      <MutedText>
        Scope lines as of this snapshot — all validated quotes effective at this date.
      </MutedText>
      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead>Task</TableHead>
              <TableHead>Profile</TableHead>
              <ThRight>Baseline Days</ThRight>
              <ThRight>Sell Rate/day</ThRight>
              <ThRight>Cost Rate Assumption/day</ThRight>
              <ThRight>Revenue</ThRight>
              <ThRight>Budget Cost</ThRight>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.taskId}|${row.profileId}`} variant="interactive">
                <TdDetail>{getTaskName(row.taskId)}</TdDetail>
                <TdDetail>{getProfileName(row.profileId)}</TdDetail>
                <TdNumeric>
                  {formatDays(row.baselineDaysTotalAsofSnapshot)}
                </TdNumeric>
                <TdNumericLight>
                  {formatCurrency(row.sellRatePerDay)}
                </TdNumericLight>
                <TdRight tabularNums muted>
                  {formatCurrency(row.costRateAssumptionPerDay)}
                </TdRight>
                <TdNumericPrimary>
                  {formatCurrency(row.baselineRevenueTotal)}
                </TdNumericPrimary>
                <TdNumericLight>
                  {formatCurrency(row.baselineBudgetCostTotal)}
                </TdNumericLight>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <FlexRow wrap gap="lg">
        <KpiCard label="Total Days" value={formatDays(totalDays)} />
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KpiCard label="Total Budget Cost" value={formatCurrency(totalBudgetCost)} />
        <KpiCard label="Total Margin" value={formatCurrency(totalRevenue - totalBudgetCost)} variant="highlight" />
      </FlexRow>
    </VStack>
  )
}
