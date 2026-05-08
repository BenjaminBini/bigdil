import type { ReactNode } from 'react'
import { StickyThead } from '@/components/shared/grid-table'
import { QuoteTh, QuoteGroupTh } from '@/components/shared/quote-grid-cells'

function QuoteHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>
}

function QuoteSubHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>
}

export function QuoteGridHeader() {
  return (
    <StickyThead>
      <QuoteHeaderRow>
        <QuoteTh align="left" rowSpan={2}>Tâche / Profil</QuoteTh>
        <QuoteTh rowSpan={2}>Jours</QuoteTh>
        <QuoteGroupTh colSpan={2} color="blue" bordered="both">Chiffre d'affaires</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="orange" bordered="right">Coût</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="muted">Marge</QuoteGroupTh>
      </QuoteHeaderRow>
      <QuoteSubHeaderRow>
        <QuoteTh borderLeft>TJM vente</QuoteTh>
        <QuoteTh borderRight>Montant</QuoteTh>
        <QuoteTh>TJM coût</QuoteTh>
        <QuoteTh borderRight>Montant</QuoteTh>
        <QuoteTh>Montant</QuoteTh>
        <QuoteTh>%</QuoteTh>
      </QuoteSubHeaderRow>
    </StickyThead>
  )
}
