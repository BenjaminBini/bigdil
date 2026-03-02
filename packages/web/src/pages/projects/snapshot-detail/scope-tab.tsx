import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/kpi-card'
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
    <div className="pt-4 space-y-4">
      <p className="text-sm text-gray-500">
        Scope lines as of this snapshot — all validated quotes effective at this date.
      </p>
      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Task</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead className="text-right">Baseline Days</TableHead>
              <TableHead className="text-right">Sell Rate/day</TableHead>
              <TableHead className="text-right">Cost Rate Assumption/day</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Budget Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.taskId}|${row.profileId}`} className="hover:bg-gray-50">
                <TableCell className="text-gray-700 text-sm">{getTaskName(row.taskId)}</TableCell>
                <TableCell className="text-gray-600 text-sm">{getProfileName(row.profileId)}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">
                  {formatDays(row.baselineDaysTotalAsofSnapshot)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-gray-600">
                  {formatCurrency(row.sellRatePerDay)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-gray-500">
                  {formatCurrency(row.costRateAssumptionPerDay)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-gray-900">
                  {formatCurrency(row.baselineRevenueTotal)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-gray-600">
                  {formatCurrency(row.baselineBudgetCostTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-wrap gap-4">
        <KpiCard label="Total Days" value={formatDays(totalDays)} />
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KpiCard label="Total Budget Cost" value={formatCurrency(totalBudgetCost)} />
        <KpiCard label="Total Margin" value={formatCurrency(totalRevenue - totalBudgetCost)} variant="highlight" />
      </div>
    </div>
  )
}
