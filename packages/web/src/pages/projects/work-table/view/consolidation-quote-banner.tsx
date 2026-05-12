import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PeriodInfo, Quote } from '@/api/types'
import { AlertBanner } from '@/components/shared/alert-banner'
import { formatCurrency } from '@/lib/format'

interface ConsolidationQuoteBannerProps {
  periods: PeriodInfo[]
  quotes: Quote[]
}

function getConsolidationDateRange(periods: PeriodInfo[]): { start: string; end: string } | null {
  let start: string | null = null
  let end: string | null = null
  for (const p of periods) {
    if (p.status !== 'CONSOLIDATION') continue
    if (start === null || p.startDate < start) start = p.startDate
    if (end === null || p.endDate > end) end = p.endDate
  }
  if (start === null || end === null) return null
  return { start, end }
}

interface QuoteSummary {
  id: string
  title: string
  revenue: number
  days: number
}

function summarizeQuote(quote: Quote): QuoteSummary {
  let revenue = 0
  let days = 0
  for (const line of quote.lines) {
    revenue += line.revenueAmount
    days += line.days
  }
  return { id: quote.id, title: quote.title, revenue, days }
}

function formatDays(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

export function ConsolidationQuoteBanner({ periods, quotes }: ConsolidationQuoteBannerProps) {
  const { t } = useTranslation('pages')
  const range = getConsolidationDateRange(periods)
  if (!range) return null

  const matched = quotes
    .filter((q) => q.status === 'VALIDATED' && q.validatedAt !== null)
    .filter((q) => q.validatedAt! >= range.start && q.validatedAt! <= range.end)
    .map(summarizeQuote)

  if (matched.length === 0) return null

  return (
    <AlertBanner
      variant="info"
      size="compact"
      icon={<Sparkles size={16} className="text-blue-600 dark:text-blue-400" />}
      title={t('workTable.consolidationBanner.title')}
      description={t('workTable.consolidationBanner.description')}
    >
      <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-300">
        {matched.map((q) => (
          <li key={q.id} className="font-mono tabular-nums">
            {t('workTable.consolidationBanner.quoteLine', {
              title: q.title,
              revenue: formatCurrency(q.revenue),
              days: formatDays(q.days),
            })}
          </li>
        ))}
      </ul>
    </AlertBanner>
  )
}
