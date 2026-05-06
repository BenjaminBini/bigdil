import type { ReactNode } from 'react'
import { StickyThead } from '@/components/shared/grid-table'
import { QuoteTh, QuoteGroupTh } from '@/components/shared/quote-grid-cells'

function QuoteHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-gray-200">{children}</tr>
}

function QuoteSubHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-gray-300">{children}</tr>
}

export function QuoteGridHeader() {
  return (
    <StickyThead>
      <QuoteHeaderRow>
        <QuoteTh align="left" rowSpan={2}>Task / Profile</QuoteTh>
        <QuoteTh rowSpan={2}>Days</QuoteTh>
        <QuoteGroupTh colSpan={2} color="blue" bordered="both">Revenue</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="orange" bordered="right">Cost</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="muted">Margin</QuoteGroupTh>
      </QuoteHeaderRow>
      <QuoteSubHeaderRow>
        <QuoteTh borderLeft>Sell/Day</QuoteTh>
        <QuoteTh borderRight>Amount</QuoteTh>
        <QuoteTh>Cost/Day</QuoteTh>
        <QuoteTh borderRight>Amount</QuoteTh>
        <QuoteTh>Amount</QuoteTh>
        <QuoteTh>%</QuoteTh>
      </QuoteSubHeaderRow>
    </StickyThead>
  )
}
