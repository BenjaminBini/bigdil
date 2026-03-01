import { useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle, Copy, Download, Info, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useProject, useReferenceData } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import { buildQuoteGrid, buildValidatedRateKeys } from './quote-detail/model'
import { QuoteStatusBadge } from './quote-detail/quote-status-badge'
import { QuoteGrid } from './quote-detail/quote-grid'
import { ValidateDialog } from './quote-detail/validate-dialog'

export default function QuoteDetailPage() {
  const { id: projectId, quoteId } = useParams()
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const { data, isLoading, error } = useProject(projectId!)
  const { data: refData, isLoading: refLoading } = useReferenceData()

  if (isLoading || refLoading) return <div className="p-6">Loading...</div>
  if (error || !data || !refData) return <div className="p-6">Error loading data</div>

  const getTaskName = (taskId: string) => data.flatTasks.find(t => t.id === taskId)?.name ?? taskId
  const getProfileName = (profileId: string) => refData.profiles.find(p => p.id === profileId)?.name ?? profileId
  const quote = data.quotes.find((q) => q.id === quoteId)

  const validatedQuotes = data.quotes.filter(q => q.status === 'VALIDATED' && q.id !== quoteId)
  const isChangeOrder = validatedQuotes.length > 0
  const frozenRateKeys = isChangeOrder ? buildValidatedRateKeys(validatedQuotes[0]) : new Set<string>()

  const isValidated = quote?.status === 'VALIDATED'
  const isDraft = quote?.status === 'DRAFT'

  function toggleCollapse(rowId: string) {
    setCollapsed(prev => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  function handleValidate() {
    setValidateDialogOpen(false)
    toast.success('Quote validated', {
      description: 'All sell rates for this quote have been frozen.',
    })
  }

  if (!quote) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-500">Quote not found.</p>
      </div>
    )
  }

  const gridRows = buildQuoteGrid(quote, data.flatTasks, frozenRateKeys, isChangeOrder, getTaskName, getProfileName)
  const hasChildrenSet = new Set<string>()
  for (const row of gridRows) {
    if (row.kind === 'task') hasChildrenSet.add(`phase-${row.phaseId}`)
    if (row.kind === 'profile' && row.taskId) hasChildrenSet.add(`task-${row.taskId}`)
  }

  const visibleRows = gridRows.filter(row => {
    if (row.kind === 'phase' || row.kind === 'grand-total') return true
    if (row.kind === 'task') return !collapsed[`phase-${row.phaseId}`]
    if (row.kind === 'profile') return !collapsed[`phase-${row.phaseId}`] && !collapsed[`task-${row.taskId}`]
    return true
  })

  const totalRow = gridRows.find(r => r.kind === 'grand-total')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{quote.title}</h1>
            <QuoteStatusBadge status={quote.status} />
            {isValidated && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Lock className="size-3" />
                Read-only
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {quote.effectiveAt && (
              <span>Effective: <span className="text-gray-700">{formatDate(quote.effectiveAt)}</span></span>
            )}
            {quote.validatedAt && (
              <span>Validated: <span className="text-gray-700">{formatDate(quote.validatedAt)}</span></span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDraft && (
            <Button onClick={() => setValidateDialogOpen(true)} className="gap-1.5">
              <CheckCircle className="size-4" />
              Validate Quote
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast.info('Would duplicate quote')}>
            <Copy className="size-3.5" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Would export quote')}>
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {isChangeOrder && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>Change Order</strong> — adds to existing scope. Sell rates match previously
            validated rates for the same Task + Profile combinations.
          </span>
        </div>
      )}

      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <QuoteGrid
          rows={visibleRows}
          isReadOnly={isValidated || false}
          collapsed={collapsed}
          onToggle={toggleCollapse}
          hasChildrenSet={hasChildrenSet}
        />
      </div>

      {totalRow && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Days</p>
              <p className="text-base font-semibold tabular-nums text-gray-900">{totalRow.days}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Revenue (ex-VAT)</p>
              <p className="text-base font-semibold tabular-nums text-gray-900">{formatCurrency(totalRow.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Budget Cost</p>
              <p className="text-base font-semibold tabular-nums text-gray-600">{formatCurrency(totalRow.cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Margin</p>
              <p className="text-base font-semibold tabular-nums text-gray-800">{formatCurrency(totalRow.margin)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Margin %</p>
              <p className="text-base font-semibold tabular-nums text-gray-800">{totalRow.marginPct?.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      <ValidateDialog
        open={validateDialogOpen}
        onConfirm={handleValidate}
        onClose={() => setValidateDialogOpen(false)}
      />
    </div>
  )
}
