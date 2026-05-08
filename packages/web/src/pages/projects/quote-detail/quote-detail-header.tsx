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
  return <span className="text-sm text-muted-foreground">{children}</span>
}

function MetaValue({ children }: { children: ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
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
              <Lock size={12} className="text-muted-foreground" />
              <TextCaption>Lecture seule</TextCaption>
            </InlineStack>
          )}
        </FlexRow>
        <FlexRow gap="lg">
          <MetaText>
            Date d'effet : <MetaValue>{quote.effectiveAt ? formatDate(quote.effectiveAt) : '—'}</MetaValue>
          </MetaText>
          <MetaText>
            Validé le : <MetaValue>{quote.validatedAt ? formatDate(quote.validatedAt) : '—'}</MetaValue>
          </MetaText>
        </FlexRow>
      </VStack>

      <ActionsRow>
        {isDraft && (
          <Button onClick={onValidate}>
            <CheckCircle size={16} />
            Valider le devis
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy size={14} />
          Dupliquer
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={14} />
          Exporter
        </Button>
      </ActionsRow>
    </FlexBetween>
  )
}
