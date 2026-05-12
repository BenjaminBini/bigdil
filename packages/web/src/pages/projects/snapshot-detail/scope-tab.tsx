import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  const totalRevenue = rows.reduce((s, r) => s + r.baselineRevenueTotal, 0)
  const totalBudgetCost = rows.reduce((s, r) => s + r.baselineBudgetCostTotal, 0)
  const totalDays = rows.reduce((s, r) => s + r.baselineDaysTotalAsofSnapshot, 0)

  return (
    <VStack gap="xl" pt="md">
      <MutedText>
        {t('snapshots.scope.intro')}
      </MutedText>
      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead>{t('snapshots.scope.task')}</TableHead>
              <TableHead>{t('snapshots.scope.profile')}</TableHead>
              <ThRight>{t('snapshots.scope.baselineDays')}</ThRight>
              <ThRight>{t('snapshots.scope.sellRatePerDay')}</ThRight>
              <ThRight>{t('snapshots.scope.costRateAssumption')}</ThRight>
              <ThRight>{t('snapshots.scope.revenue')}</ThRight>
              <ThRight>{t('snapshots.scope.budgetCost')}</ThRight>
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
        <KpiCard label={t('snapshots.scope.totalDays')} value={formatDays(totalDays)} />
        <KpiCard label={t('snapshots.scope.totalRevenue')} value={formatCurrency(totalRevenue)} />
        <KpiCard label={t('snapshots.scope.totalBudgetCost')} value={formatCurrency(totalBudgetCost)} />
        <KpiCard label={t('snapshots.scope.totalMargin')} value={formatCurrency(totalRevenue - totalBudgetCost)} variant="highlight" />
      </FlexRow>
    </VStack>
  )
}
