import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
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

// ---- Helpers ----

function computeQuoteTotals(quote: Quote) {
  const totalDays = quote.lines.reduce((s, l) => s + l.days, 0)
  const totalRevenue = quote.lines.reduce((s, l) => s + l.revenueAmount, 0)
  const totalBudgetCost = quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0)
  const totalMargin = totalRevenue - totalBudgetCost
  const marginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0
  return { totalDays, totalRevenue, totalBudgetCost, totalMargin, marginPct }
}

// ---- Quotes page ----

export default function QuotesPage() {
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
      {/* Page header */}
      <FlexBetween>
        <div>
          <PageTitle>Quotes</PageTitle>
          <MutedText spacing="tight">
            All quotes and change orders for this project
          </MutedText>
        </div>
        <Button onClick={() => setShowNewQuote(true)}>
          <Plus />
          New Quote
        </Button>
      </FlexBetween>

      {/* Table */}
      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Validated Date</TableHead>
              <ThRight>Total Days</ThRight>
              <ThRight>Revenue (ex-VAT)</ThRight>
              <ThRight>Budget Cost</ThRight>
              <ThRight>Margin</ThRight>
              <ThRight>Margin %</ThRight>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <EmptyRow colSpan={9} message="No quotes yet" />
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
                    <TdPrimary>
                      {quote.title}
                    </TdPrimary>
                    <TdDetail>
                      <StatusBadge status={quote.status} />
                    </TdDetail>
                    <TdDetail tabularNums>
                      {formatDate(quote.effectiveAt)}
                    </TdDetail>
                    <TdDetail tabularNums>
                      {formatDate(quote.validatedAt)}
                    </TdDetail>
                    <TdNumeric>
                      {totalDays}
                    </TdNumeric>
                    <TdNumericPrimary>
                      {formatCurrency(totalRevenue)}
                    </TdNumericPrimary>
                    <TdNumericLight>
                      {formatCurrency(totalBudgetCost)}
                    </TdNumericLight>
                    <TdRight bold>
                      {formatCurrency(totalMargin)}
                    </TdRight>
                    <TdNumeric>
                      {marginPct.toFixed(1)}%
                    </TdNumeric>
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
        tasks={data.flatTasks}
        profiles={refData.profiles}
      />
    </PageContainer>
  )
}
