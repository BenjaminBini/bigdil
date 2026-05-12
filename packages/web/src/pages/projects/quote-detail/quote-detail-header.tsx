import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Copy, Download, Lock, Send, Trash2, Undo2, Ban, XCircle } from 'lucide-react'
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
  canDelete: boolean
  onSend: () => void
  onValidate: () => void
  onUnvalidate: () => void
  onReject: () => void
  onCancel: () => void
  onReopen: () => void
  onDuplicate: () => void
  onDelete: () => void
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
  canDelete,
  onSend,
  onValidate,
  onUnvalidate,
  onReject,
  onCancel,
  onReopen,
  onDuplicate,
  onDelete,
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
              <TextCaption>{t('quotes.detail.readOnly')}</TextCaption>
            </InlineStack>
          )}
        </FlexRow>
        <FlexRow gap="lg">
          <MetaText>
            {t('quotes.detail.effectiveAtLabel')}<MetaValue>{quote.effectiveAt ? formatDate(quote.effectiveAt) : '—'}</MetaValue>
          </MetaText>
          {quote.sentAt && (
            <MetaText>
              {t('quotes.detail.sentAtLabel')}<MetaValue>{formatDate(quote.sentAt)}</MetaValue>
            </MetaText>
          )}
          {quote.validatedAt && (
            <MetaText>
              {t('quotes.detail.validatedAtLabel')}<MetaValue>{formatDate(quote.validatedAt)}</MetaValue>
            </MetaText>
          )}
          {quote.rejectedAt && (
            <MetaText>
              {t('quotes.detail.rejectedAtLabel')}<MetaValue>{formatDate(quote.rejectedAt)}</MetaValue>
            </MetaText>
          )}
          {quote.cancelledAt && (
            <MetaText>
              {t('quotes.detail.cancelledAtLabel')}<MetaValue>{formatDate(quote.cancelledAt)}</MetaValue>
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
        {isValidated && (
          <Button variant="outline" size="sm" onClick={onUnvalidate}>
            <Undo2 size={14} />
            {t('quotes.actions.unvalidate')}
          </Button>
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
        {canDelete && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 size={14} />
            {t('quotes.actions.delete')}
          </Button>
        )}
      </ActionsRow>
    </FlexBetween>
  )
}
