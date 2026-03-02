import { StatusBadge } from '@/components/shared/status-badge'
import type { Quote } from '@/api/types'

export function QuoteStatusBadge({ status }: { status: Quote['status'] }) {
  return <StatusBadge status={status} />
}
