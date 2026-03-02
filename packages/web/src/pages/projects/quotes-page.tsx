import { useParams, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { useProject } from '@/api/hooks'
import type { Quote } from '@/api/types'
import { quoteStatusColors } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// ---- Helpers ----

function computeQuoteTotals(quote: Quote) {
  const totalDays = quote.lines.reduce((s, l) => s + l.days, 0)
  const totalRevenue = quote.lines.reduce((s, l) => s + l.revenueAmount, 0)
  const totalBudgetCost = quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0)
  const totalMargin = totalRevenue - totalBudgetCost
  const marginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0
  return { totalDays, totalRevenue, totalBudgetCost, totalMargin, marginPct }
}

// ---- Status badge ----

function QuoteStatusBadge({ status }: { status: Quote['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        quoteStatusColors[status],
      )}
    >
      {status}
    </span>
  )
}

// ---- Quotes page ----

export default function QuotesPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useProject(projectId!)

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !data) return <div className="p-6">Error loading data</div>

  const quotes = data.quotes

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All quotes and change orders for this project
          </p>
        </div>
        <Button>
          <Plus />
          New Quote
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Validated Date</TableHead>
              <TableHead className="text-right">Total Days</TableHead>
              <TableHead className="text-right">Revenue (ex-VAT)</TableHead>
              <TableHead className="text-right">Budget Cost</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead className="text-right">Margin %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                  No quotes yet
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => {
                const { totalDays, totalRevenue, totalBudgetCost, totalMargin, marginPct } =
                  computeQuoteTotals(quote)
                return (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/projects/${projectId}/quotes/${quote.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900 py-3.5">
                      {quote.title}
                    </TableCell>
                    <TableCell>
                      <QuoteStatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell className="text-gray-600 tabular-nums">
                      {formatDate(quote.effectiveAt)}
                    </TableCell>
                    <TableCell className="text-gray-600 tabular-nums">
                      {formatDate(quote.validatedAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {totalDays}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-600">
                      {formatCurrency(totalBudgetCost)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-gray-800">
                      {formatCurrency(totalMargin)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {marginPct.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
