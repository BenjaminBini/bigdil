import type { ReactNode } from 'react'
import { CheckCircle, Copy, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { Quote } from '@/api/types'
import { PageTitle } from '@/components/shared/page-title'
import { FlexRow, FlexBetween } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { InlineStack } from '@/components/shared/inline-stack'
import { TextCaption } from '@/components/shared/text-caption'
import { QuoteStatusBadge } from './quote-status-badge'

interface QuoteDetailHeaderProps {
  quote: Quote
  isDraft: boolean
  isValidated: boolean
  onValidate: () => void
  onDuplicate: () => void
  onExport: () => void
}

function MetaText({ children }: { children: ReactNode }) {
  return <span className="text-sm text-gray-500">{children}</span>
}

function MetaValue({ children }: { children: ReactNode }) {
  return <span className="text-gray-700">{children}</span>
}

function ActionsRow({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2">{children}</div>
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
    <FlexBetween align="start" gap="lg">
      <VStack gap="xs">
        <FlexRow wrap>
          <PageTitle>{quote.title}</PageTitle>
          <QuoteStatusBadge status={quote.status} />
          {isValidated && (
            <InlineStack gap="xs">
              <Lock size={12} className="text-gray-400" />
              <TextCaption>Read-only</TextCaption>
            </InlineStack>
          )}
        </FlexRow>
        <FlexRow gap="lg">
          {quote.effectiveAt && (
            <MetaText>
              Effective: <MetaValue>{formatDate(quote.effectiveAt)}</MetaValue>
            </MetaText>
          )}
          {quote.validatedAt && (
            <MetaText>
              Validated: <MetaValue>{formatDate(quote.validatedAt)}</MetaValue>
            </MetaText>
          )}
        </FlexRow>
      </VStack>

      <ActionsRow>
        {isDraft && (
          <Button onClick={onValidate}>
            <CheckCircle size={16} />
            Validate Quote
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy size={14} />
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={14} />
          Export
        </Button>
      </ActionsRow>
    </FlexBetween>
  )
}
