import { cn } from '@/lib/utils'
import { quoteStatusColors } from '@/lib/constants'
import type { Quote } from '@/api/types'

export function QuoteStatusBadge({ status }: { status: Quote['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        quoteStatusColors[status],
      )}
    >
      {status}
    </span>
  )
}
