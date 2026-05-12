import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProject, useReferenceData } from '@/api/hooks'
import type { Quote } from '@/api/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TdPrimary, TdNumeric, TdNumericLight, TdNumericPrimary, TdDetail, TdRight, ThRight } from '@/components/shared/table-cells'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyRow } from '@/components/shared/empty-row'
import { NewQuoteDialog } from './quotes/new-quote-dialog'

function computeQuoteTotals(quote: Quote) {
  const totalDays = quote.lines.reduce((s, l) => s + l.days, 0)
  const totalRevenue = quote.lines.reduce((s, l) => s + l.revenueAmount, 0)
  const totalBudgetCost = quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0)
  const totalMargin = totalRevenue - totalBudgetCost
  const marginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0
  return { totalDays, totalRevenue, totalBudgetCost, totalMargin, marginPct }
}

export default function QuotesPage() {
  const { t } = useTranslation('pages')
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const [showNewQuote, setShowNewQuote] = useState(false)
  const { data, isLoading, error } = useProject(projectId!)
  const { data: refData, isLoading: refLoading } = useReferenceData()

  if (isLoading || refLoading) return <LoadingState />
  if (error || !data || !refData) return <ErrorState />

  const quotes = data.quotes

  return (
    <PageContainer size="lg">
      <FlexBetween>
        <div>
          <PageTitle>{t('quotes.title')}</PageTitle>
          <MutedText spacing="tight">{t('quotes.subtitle')}</MutedText>
        </div>
        <Button onClick={() => setShowNewQuote(true)}>
          <Plus />
          {t('quotes.newQuote')}
        </Button>
      </FlexBetween>

      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead>{t('quotes.table.title')}</TableHead>
              <TableHead>{t('quotes.table.status')}</TableHead>
              <TableHead>{t('quotes.table.effectiveAt')}</TableHead>
              <TableHead>{t('quotes.table.validatedAt')}</TableHead>
              <ThRight>{t('quotes.table.days')}</ThRight>
              <ThRight>{t('quotes.table.revenue')}</ThRight>
              <ThRight>{t('quotes.table.budgetCost')}</ThRight>
              <ThRight>{t('quotes.table.margin')}</ThRight>
              <ThRight>{t('quotes.table.marginPct')}</ThRight>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <EmptyRow colSpan={9} message={t('quotes.empty')} />
            ) : (
              quotes.map((quote) => {
                const { totalDays, totalRevenue, totalBudgetCost, totalMargin, marginPct } =
                  computeQuoteTotals(quote)
                return (
                  <TableRow
                    key={quote.id}
                    variant="interactive"
                    onClick={() => navigate(`/projects/${projectId}/quotes/${quote.id}`)}
                  >
                    <TdPrimary>{quote.title}</TdPrimary>
                    <TdDetail>
                      <StatusBadge status={quote.status} />
                    </TdDetail>
                    <TdDetail tabularNums>{formatDate(quote.effectiveAt)}</TdDetail>
                    <TdDetail tabularNums>{formatDate(quote.validatedAt)}</TdDetail>
                    <TdNumeric>{totalDays}</TdNumeric>
                    <TdNumericPrimary>{formatCurrency(totalRevenue)}</TdNumericPrimary>
                    <TdNumericLight>{formatCurrency(totalBudgetCost)}</TdNumericLight>
                    <TdRight bold>{formatCurrency(totalMargin)}</TdRight>
                    <TdNumeric>{marginPct.toFixed(1)}%</TdNumeric>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <NewQuoteDialog
        open={showNewQuote}
        onClose={() => setShowNewQuote(false)}
        projectId={projectId!}
      />
    </PageContainer>
  )
}
