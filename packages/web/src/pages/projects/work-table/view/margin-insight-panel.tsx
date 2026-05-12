import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MetricStrip } from '@/components/shared/metric-strip'
import { ColorValue } from '@/components/shared/color-value'
import { BottomBar, FlexBetween } from '@/components/shared/layouts'
import { formatCurrency, formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MarginInsightEmployee } from '@/lib/work-table/types'

interface EmployeeCardProps {
  emp: MarginInsightEmployee
}

function EmployeeCard({ emp }: EmployeeCardProps) {
  const { t } = useTranslation('pages')
  const hasImpact = emp.rateImpact !== 0
  const isNegative = emp.rateImpact > 0
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-sm border px-3 py-2',
        isNegative
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
          : hasImpact
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'border-border bg-muted/50',
      )}
    >
      <FlexBetween align="start" gap="md">
        <div>
          <p className="text-xs font-semibold text-foreground">{emp.employeeName}</p>
          <p className="text-xs text-muted-foreground">{emp.profileName}</p>
        </div>
        <span className="whitespace-nowrap text-xs font-mono text-foreground/70">
          {t('workTable.marginInsight.daysRemaining', { days: formatDays(emp.remainingDays) })}
        </span>
      </FlexBetween>
      <div className="text-xs text-foreground/70">
        <ColorValue
          value={t('workTable.marginInsight.rateComparison', { actual: emp.actualCostRate, assumed: emp.assumedCostRate })}
          sentiment={isNegative ? 'negative' : hasImpact ? 'positive' : 'neutral'}
        />
        {hasImpact && (
          <>
            {' '}
            <ColorValue
              value={t('workTable.marginInsight.rateImpact', { sign: isNegative ? '+' : '', impact: emp.rateImpact })}
              sentiment={isNegative ? 'negative' : 'positive'}
            />
          </>
        )}
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        {t('workTable.marginInsight.etc', { value: formatCurrency(emp.etcCost) })}
      </div>
    </div>
  )
}

function EmployeeCardGrid({ children }: { children: ReactNode }) {
  return <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

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
  const { t } = useTranslation('pages')
  return (
    <BottomBar size="lg">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('workTable.marginInsight.title')}
      </p>
      <EmployeeCardGrid>
        {insight.employees.map((emp) => (
          <EmployeeCard key={`${emp.employeeId}-${emp.profileId}`} emp={emp} />
        ))}
      </EmployeeCardGrid>
      <div className="border-t pt-3">
        <MetricStrip
          items={[
            { label: t('workTable.marginInsight.totalEtcCost'), value: <ColorValue value={insight.totalEtcCost} format="currency" sentiment="neutral" /> },
            { label: t('workTable.marginInsight.contractValue'), value: <ColorValue value={insight.totalContractValue} format="currency" sentiment="neutral" /> },
            {
              label: t('workTable.marginInsight.marginForecast'),
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
    </BottomBar>
  )
}
