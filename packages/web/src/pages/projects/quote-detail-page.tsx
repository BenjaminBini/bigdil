import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useProject, useReferenceData, useValidateQuote, useDuplicateQuote } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { VStack } from '@/components/shared/VStack'
import { buildQuoteGrid } from './quote-detail/model'
import { QuoteDetailHeader } from './quote-detail/quote-detail-header'
import { QuoteGrid } from './quote-detail/quote-grid'
import { QuoteDraftGrid } from './quote-detail/quote-draft-grid'
import { QuoteTotalsCard } from './quote-detail/quote-totals-card'
import { ValidateDialog } from './quote-detail/validate-dialog'

export default function QuoteDetailPage() {
  const { id: projectId, quoteId } = useParams()
  const navigate = useNavigate()
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const { data, isLoading, error } = useProject(projectId!)
  const { data: refData, isLoading: refLoading } = useReferenceData()
  const validateQuote = useValidateQuote(projectId!)
  const duplicateQuote = useDuplicateQuote(projectId!)

  if (isLoading || refLoading) return <LoadingState />
  if (error || !data || !refData) return <ErrorState />

  const quote = data.quotes.find((entry) => entry.id === quoteId)
  if (!quote) return <ErrorState message="Quote not found." variant="muted" />

  const getTaskName = (taskId: string) => data.flatTasks.find((task) => task.id === taskId)?.name ?? taskId
  const getProfileName = (profileId: string) => refData.profiles.find((profile) => profile.id === profileId)?.name ?? profileId

  const isValidated = quote.status === 'VALIDATED'
  const isDraft = quote.status === 'DRAFT'

  function toggleCollapse(rowId: string) {
    setCollapsed((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  function handleValidate() {
    validateQuote.mutate(quoteId!, {
      onSuccess: () => {
        setValidateDialogOpen(false)
        toast.success('Devis validé', { description: 'Tous les TJM de vente ont été gelés.' })
      },
      onError: () => toast.error('Échec de la validation'),
    })
  }

  const gridRows = buildQuoteGrid(quote, data.flatTasks, getTaskName, getProfileName)

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
    <VStack gap="xl">
      <QuoteDetailHeader
        quote={quote}
        isDraft={isDraft}
        isValidated={isValidated}
        onValidate={() => setValidateDialogOpen(true)}
        onDuplicate={() => {
          duplicateQuote.mutate(quoteId!, {
            onSuccess: (newQuote) => {
              toast.success(`"${newQuote.title}" dupliqué`)
              void navigate(`/projects/${projectId}/quotes/${newQuote.id}`)
            },
            onError: () => toast.error('Échec de la duplication'),
          })
        }}
        onExport={() => toast.info('Export à venir')}
      />

      <Card variant="flush">
        {isDraft ? (
          <QuoteDraftGrid
            projectId={projectId!}
            quoteId={quoteId!}
            flatTasks={data.flatTasks}
            profiles={refData.profiles}
            lines={quote.lines}
          />
        ) : (
          <QuoteGrid
            rows={visibleRows}
            isReadOnly={isValidated}
            collapsed={collapsed}
            onToggle={toggleCollapse}
            hasChildrenSet={hasChildrenSet}
          />
        )}
      </Card>

      {totalRow && !isDraft && <QuoteTotalsCard totalRow={totalRow} />}
      {isDraft && <QuoteTotalsCard totalRow={{
        id: 'totals', kind: 'grand-total', phaseId: '', label: 'Total général', depth: 0,
        days: quote.lines.reduce((s, l) => s + l.days, 0),
        revenue: quote.lines.reduce((s, l) => s + l.revenueAmount, 0),
        cost: quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0),
        margin: quote.lines.reduce((s, l) => s + l.revenueAmount - l.budgetCostAmount, 0),
        marginPct: (() => { const rev = quote.lines.reduce((s, l) => s + l.revenueAmount, 0); const cost = quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0); return rev > 0 ? ((rev - cost) / rev) * 100 : null })(),
        sellRatePerDay: null, costRatePerDay: null, isFrozenRate: false,
      }} />}

      <ValidateDialog open={validateDialogOpen} onConfirm={handleValidate} onClose={() => setValidateDialogOpen(false)} />
    </VStack>
  )
}
