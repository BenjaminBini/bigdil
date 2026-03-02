import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricStrip } from '@/components/shared/metric-strip'
import { ColorValue } from '@/components/shared/color-value'
import { formatCurrency, formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MarginInsightEmployee } from '@/lib/work-table/types'

interface MarginInsightProps {
  insight: {
    employees: MarginInsightEmployee[]
    totalEtcCost: number
    totalContractValue: number
    marginForecast: number
    marginPercent: number
  }
}

export function MarginInsightPanel({ insight }: MarginInsightProps) {
  return (
    <div className="shrink-0 border-t bg-white px-4 py-4">
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b bg-slate-50 px-4 py-3">
          <CardTitle className="text-sm font-semibold text-slate-800">Margin Insight</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insight.employees.map((emp) => {
              const hasImpact = emp.rateImpact !== 0
              const isNegative = emp.rateImpact > 0
              return (
                <div
                  key={`${emp.employeeId}-${emp.profileId}`}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border px-3 py-2',
                    isNegative
                      ? 'border-red-200 bg-red-50'
                      : hasImpact
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{emp.employeeName}</p>
                      <p className="text-xs text-slate-500">{emp.profileName}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs font-mono text-slate-600">
                      {formatDays(emp.remainingDays)}d remaining
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className={cn(isNegative ? 'text-red-700' : hasImpact ? 'text-emerald-700' : 'text-slate-600')}>
                      {emp.actualCostRate}€/d (actual) vs {emp.assumedCostRate}€/d (assumed)
                    </span>
                    {hasImpact && (
                      <span className={cn('ml-1.5 font-semibold', isNegative ? 'text-red-700' : 'text-emerald-700')}>
                        → {isNegative ? '+' : ''}
                        {emp.rateImpact}€/d impact
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-500">ETC: {formatCurrency(emp.etcCost)}</div>
                </div>
              )
            })}
          </div>

          <MetricStrip
            className="border-t pt-3"
            items={[
              { label: 'Total ETC Cost', value: <span className="font-mono font-semibold">{formatCurrency(insight.totalEtcCost)}</span> },
              { label: 'Contract Value', value: <span className="font-mono font-semibold">{formatCurrency(insight.totalContractValue)}</span> },
              {
                label: 'Margin Forecast',
                value: (
                  <>
                    <ColorValue value={insight.marginForecast} format="currency" className="font-mono" />
                    {' '}
                    <span className="text-sm">({insight.marginPercent.toFixed(1)}%)</span>
                  </>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
