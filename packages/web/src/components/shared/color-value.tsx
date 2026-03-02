import { cn } from '@/lib/utils'
import { formatCurrency, formatDays } from '@/lib/format'

type Sentiment = 'auto' | 'positive' | 'negative' | 'neutral' | 'warning'
type Format = 'currency' | 'percent' | 'days' | 'number' | 'raw'

export interface ColorValueProps {
  value: number | string
  sentiment?: Sentiment
  format?: Format
  className?: string
}

const SENTIMENT_COLORS: Record<Exclude<Sentiment, 'auto'>, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral: 'text-muted-foreground',
  warning: 'text-amber-600',
}

function resolveSentiment(sentiment: Sentiment, value: number | string): Exclude<Sentiment, 'auto'> {
  if (sentiment !== 'auto') return sentiment
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'positive' : 'negative'
}

function formatValue(value: number | string, format: Format): string {
  if (format === 'raw') return String(value)
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return String(value)
  switch (format) {
    case 'currency': return formatCurrency(num)
    case 'percent': return `${num.toFixed(1)}%`
    case 'days': return `${num % 1 === 0 ? num : num.toFixed(2)}d`
    case 'number': return num.toLocaleString('fr-FR')
  }
}

export function ColorValue({
  value,
  sentiment = 'auto',
  format = 'raw',
  className,
}: ColorValueProps) {
  const resolved = resolveSentiment(sentiment, value)
  return (
    <span className={cn('font-semibold tabular-nums', SENTIMENT_COLORS[resolved], className)}>
      {formatValue(value, format)}
    </span>
  )
}
