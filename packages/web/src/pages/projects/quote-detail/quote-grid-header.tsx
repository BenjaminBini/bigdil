import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StickyThead } from '@/components/shared/grid-table'
import { QuoteTh, QuoteGroupTh } from '@/components/shared/quote-grid-cells'

function QuoteHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>
}

function QuoteSubHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>
}

export function QuoteGridHeader() {
  const { t } = useTranslation('pages')
  return (
    <StickyThead>
      <QuoteHeaderRow>
        <QuoteTh align="left" rowSpan={2}>{t('quotes.grid.taskProfile')}</QuoteTh>
        <QuoteTh rowSpan={2}>{t('quotes.grid.days')}</QuoteTh>
        <QuoteGroupTh colSpan={2} color="blue" bordered="both">{t('quotes.grid.revenue')}</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="orange" bordered="right">{t('quotes.grid.cost')}</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="muted">{t('quotes.grid.margin')}</QuoteGroupTh>
      </QuoteHeaderRow>
      <QuoteSubHeaderRow>
        <QuoteTh borderLeft>{t('quotes.grid.sellRate')}</QuoteTh>
        <QuoteTh borderRight>{t('quotes.grid.amount')}</QuoteTh>
        <QuoteTh>{t('quotes.grid.costRate')}</QuoteTh>
        <QuoteTh borderRight>{t('quotes.grid.amount')}</QuoteTh>
        <QuoteTh>{t('quotes.grid.amount')}</QuoteTh>
        <QuoteTh>{t('quotes.grid.pct')}</QuoteTh>
      </QuoteSubHeaderRow>
    </StickyThead>
  )
}
