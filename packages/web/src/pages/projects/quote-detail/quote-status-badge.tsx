import { Badge } from '@/components/ui/badge'
import { quoteStatusColors } from '@/lib/constants'
import type { Quote } from '@/api/types'

export function QuoteStatusBadge({ status }: { status: Quote['status'] }) {
  return (
    <Badge className={quoteStatusColors[status]}>
      {status}
    </Badge>
  )
}
