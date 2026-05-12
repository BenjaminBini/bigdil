import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Copy, Download, Lock, Send, Undo2, Ban, XCircle } from 'lucide-react'
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
  onSend: () => void
  onValidate: () => void
  onReject: () => void
  onCancel: () => void
  onReopen: () => void
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
  return <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{children}</div>
}

export function QuoteDetailHeader({
  quote,
  onSend,
  onValidate,
  onReject,
  onCancel,
  onReopen,
  onDuplicate,
  onExport,
}: QuoteDetailHeaderProps) {
  const { t } = useTranslation('pages')
  const status = quote.status

  const isDraft = status === 'DRAFT'
  const isSent = status === 'SENT'
  const isValidated = status === 'VALIDATED'
  const isRejected = status === 'REJECTED'
  const isCancelled = status === 'CANCELLED'
  const isReadOnly = isValidated || isCancelled

  return (
    <FlexBetween align="start" gap="lg">
      <VStack gap="xs">
        <FlexRow wrap>
          <PageTitle>{quote.title}</PageTitle>
          <QuoteStatusBadge status={status} />
          {isReadOnly && (
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
          {quote.sentAt && (
            <MetaText>
              Envoyé le : <MetaValue>{formatDate(quote.sentAt)}</MetaValue>
            </MetaText>
          )}
          {quote.validatedAt && (
            <MetaText>
              Validé le : <MetaValue>{formatDate(quote.validatedAt)}</MetaValue>
            </MetaText>
          )}
          {quote.rejectedAt && (
            <MetaText>
              Refusé le : <MetaValue>{formatDate(quote.rejectedAt)}</MetaValue>
            </MetaText>
          )}
          {quote.cancelledAt && (
            <MetaText>
              Annulé le : <MetaValue>{formatDate(quote.cancelledAt)}</MetaValue>
            </MetaText>
          )}
        </FlexRow>
      </VStack>

      <ActionsRow>
        {isDraft && (
          <>
            <Button onClick={onSend}>
              <Send size={16} />
              {t('quotes.actions.send')}
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <Ban size={14} />
              {t('quotes.actions.cancel')}
            </Button>
          </>
        )}
        {isSent && (
          <>
            <Button onClick={onValidate}>
              <CheckCircle size={16} />
              {t('quotes.actions.validate')}
            </Button>
            <Button variant="outline" size="sm" onClick={onReject}>
              <XCircle size={14} />
              {t('quotes.actions.reject')}
            </Button>
          </>
        )}
        {isRejected && (
          <>
            <Button onClick={onReopen}>
              <Undo2 size={16} />
              {t('quotes.actions.reopen')}
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <Ban size={14} />
              {t('quotes.actions.cancel')}
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy size={14} />
          {t('quotes.actions.duplicate')}
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={14} />
          {t('quotes.actions.export')}
        </Button>
      </ActionsRow>
    </FlexBetween>
  )
}
