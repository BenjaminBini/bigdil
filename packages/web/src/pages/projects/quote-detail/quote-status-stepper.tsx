import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { quoteStatusColors } from '@/lib/constants'
import type { QuoteStatus } from '@/api/types'

interface QuoteStatusStepperProps {
  status: QuoteStatus
}

function Node({ label, status, current, terminal }: { label: string; status: QuoteStatus; current: QuoteStatus; terminal?: boolean }) {
  const isActive = status === current
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap',
        isActive
          ? cn(quoteStatusColors[status], 'ring-2 ring-offset-1 ring-current font-semibold')
          : 'bg-muted text-muted-foreground',
      )}
    >
      {terminal && isActive && <span className="mr-1">✓</span>}
      {label}
    </span>
  )
}

function Arrow({ char = '→' }: { char?: string }) {
  return (
    <span className="text-muted-foreground/40 text-xs select-none flex items-center justify-center px-0.5">
      {char}
    </span>
  )
}

/*
 * Grid layout (5 cols × 3 rows):
 *
 *  col:  1          2   3          4   5
 *  r1: [Brouillon] [→] [Envoyée]  [→] [Validée]
 *  r2:     [↓]         [↓]
 *  r3: [Annulée]   [←] [Refusée]
 *
 * Each column is min-content so nodes in r1 and r3 stay aligned.
 */
export function QuoteStatusStepper({ status }: QuoteStatusStepperProps) {
  const { t } = useTranslation('pages')
  return (
    <div
      className="inline-grid items-center text-xs gap-y-0"
      style={{ gridTemplateColumns: 'repeat(5, min-content)' }}
    >
      {/* Row 1 — main path */}
      <Node label={t('quotes.stepper.draft')} status="DRAFT" current={status} />
      <Arrow />
      <Node label={t('quotes.stepper.sent')} status="SENT" current={status} />
      <Arrow />
      <Node label={t('quotes.stepper.validated')} status="VALIDATED" current={status} terminal />

      {/* Row 2 — vertical connectors */}
      <Arrow char="↓" />
      <span />
      <Arrow char="↓" />
      <span />
      <span />

      {/* Row 3 — side states: Cancelled (col1) ← Rejected (col3) */}
      <Node label={t('quotes.stepper.cancelled')} status="CANCELLED" current={status} />
      <Arrow char="←" />
      <Node label={t('quotes.stepper.rejected')} status="REJECTED" current={status} />
      <span />
      <span />
    </div>
  )
}
