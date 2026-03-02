import { useState } from 'react'
import { useParams } from 'react-router'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { useProject, useReferenceData } from '@/api/hooks'
import { buildQuoteGrid, buildValidatedRateKeys } from './quote-detail/model'
import { QuoteDetailHeader } from './quote-detail/quote-detail-header'
import { QuoteGrid } from './quote-detail/quote-grid'
import { QuoteTotalsCard } from './quote-detail/quote-totals-card'
import { ValidateDialog } from './quote-detail/validate-dialog'

export default function QuoteDetailPage() {
  const { id: projectId, quoteId } = useParams()
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const { data, isLoading, error } = useProject(projectId!)
  const { data: refData, isLoading: refLoading } = useReferenceData()

  if (isLoading || refLoading) return <div className="p-6">Loading...</div>
  if (error || !data || !refData) return <div className="p-6">Error loading data</div>

  const quote = data.quotes.find((entry) => entry.id === quoteId)
  if (!quote) return <div className="mx-auto max-w-6xl p-6"><p className="text-gray-500">Quote not found.</p></div>

  const getTaskName = (taskId: string) => data.flatTasks.find((task) => task.id === taskId)?.name ?? taskId
  const getProfileName = (profileId: string) => refData.profiles.find((profile) => profile.id === profileId)?.name ?? profileId

  const validatedQuotes = data.quotes.filter((entry) => entry.status === 'VALIDATED' && entry.id !== quoteId)
  const isChangeOrder = validatedQuotes.length > 0
  const frozenRateKeys = isChangeOrder ? buildValidatedRateKeys(validatedQuotes[0]) : new Set<string>()

  const isValidated = quote.status === 'VALIDATED'
  const isDraft = quote.status === 'DRAFT'

  function toggleCollapse(rowId: string) {
    setCollapsed((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  function handleValidate() {
    setValidateDialogOpen(false)
    toast.success('Quote validated', { description: 'All sell rates for this quote have been frozen.' })
  }

  const gridRows = buildQuoteGrid(
    quote,
    data.flatTasks,
    frozenRateKeys,
    isChangeOrder,
    getTaskName,
    getProfileName,
  )

  const hasChildrenSet = new Set<string>()
  for (const row of gridRows) {
    if (row.kind === 'task') hasChildrenSet.add(`phase-${row.phaseId}`)
    if (row.kind === 'profile' && row.taskId) hasChildrenSet.add(`task-${row.taskId}`)
  }

  const visibleRows = gridRows.filter((row) => {
    if (row.kind === 'phase' || row.kind === 'grand-total') return true
    if (row.kind === 'task') return !collapsed[`phase-${row.phaseId}`]
    if (row.kind === 'profile') {
      return !collapsed[`phase-${row.phaseId}`] && !collapsed[`task-${row.taskId}`]
    }
    return true
  })

  const totalRow = gridRows.find((row) => row.kind === 'grand-total')

  return (
    <div className="space-y-6">
      <QuoteDetailHeader
        quote={quote}
        isDraft={isDraft}
        isValidated={isValidated}
        onValidate={() => setValidateDialogOpen(true)}
        onDuplicate={() => toast.info('Would duplicate quote')}
        onExport={() => toast.info('Would export quote')}
      />

      {isChangeOrder && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Change Order</strong> - adds to existing scope. Sell rates match previously
            validated rates for the same Task + Profile combinations.
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
        <QuoteGrid
          rows={visibleRows}
          isReadOnly={isValidated}
          collapsed={collapsed}
          onToggle={toggleCollapse}
          hasChildrenSet={hasChildrenSet}
        />
      </div>

      {totalRow && <QuoteTotalsCard totalRow={totalRow} />}

      <ValidateDialog open={validateDialogOpen} onConfirm={handleValidate} onClose={() => setValidateDialogOpen(false)} />
    </div>
  )
}
