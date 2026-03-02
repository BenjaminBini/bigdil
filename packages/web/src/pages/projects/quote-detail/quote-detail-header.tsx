import { CheckCircle, Copy, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { Quote } from '@/api/types'
import { QuoteStatusBadge } from './quote-status-badge'

interface QuoteDetailHeaderProps {
  quote: Quote
  isDraft: boolean
  isValidated: boolean
  onValidate: () => void
  onDuplicate: () => void
  onExport: () => void
}

export function QuoteDetailHeader({
  quote,
  isDraft,
  isValidated,
  onValidate,
  onDuplicate,
  onExport,
}: QuoteDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{quote.title}</h1>
          <QuoteStatusBadge status={quote.status} />
          {isValidated && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Lock className="size-3" />
              Read-only
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {quote.effectiveAt && (
            <span>
              Effective: <span className="text-gray-700">{formatDate(quote.effectiveAt)}</span>
            </span>
          )}
          {quote.validatedAt && (
            <span>
              Validated: <span className="text-gray-700">{formatDate(quote.validatedAt)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isDraft && (
          <Button onClick={onValidate}>
            <CheckCircle className="size-4" />
            Validate Quote
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="size-3.5" />
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="size-3.5" />
          Export
        </Button>
      </div>
    </div>
  )
}
