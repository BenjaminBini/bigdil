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
      <Card variant="compact">
        <CardHeader>
          <CardTitle>Margin Insight</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <ColorValue
                      value={`${emp.actualCostRate}€/d (actual) vs ${emp.assumedCostRate}€/d (assumed)`}
                      sentiment={isNegative ? 'negative' : hasImpact ? 'positive' : 'neutral'}
                    />
                    {hasImpact && (
                      <>
                        {' '}
                        <ColorValue
                          value={`→ ${isNegative ? '+' : ''}${emp.rateImpact}€/d impact`}
                          sentiment={isNegative ? 'negative' : 'positive'}
                        />
                      </>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-500">ETC: {formatCurrency(emp.etcCost)}</div>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-3">
            <MetricStrip
              items={[
                { label: 'Total ETC Cost', value: <ColorValue value={insight.totalEtcCost} format="currency" sentiment="neutral" /> },
                { label: 'Contract Value', value: <ColorValue value={insight.totalContractValue} format="currency" sentiment="neutral" /> },
                {
                  label: 'Margin Forecast',
                  value: (
                    <>
                      <ColorValue value={insight.marginForecast} format="currency" />
                      {' '}
                      <ColorValue value={`(${insight.marginPercent.toFixed(1)}%)`} sentiment={insight.marginPercent >= 0 ? 'positive' : 'negative'} />
                    </>
                  ),
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
