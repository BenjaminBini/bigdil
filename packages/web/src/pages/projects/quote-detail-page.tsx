/* eslint-disable max-lines */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  useProject,
  useReferenceData,
  useValidateQuote,
  useUnvalidateQuote,
  useDuplicateQuote,
  useSendQuote,
  useRejectQuote,
  useCancelQuote,
  useReopenQuote,
  useDeleteQuote,
} from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { AlertBanner } from '@/components/shared/alert-banner'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { VStack } from '@/components/shared/VStack'
import type { Phase, Quote, QuoteLine } from '@/api/types'
import type { QuoteGridRow } from './quote-detail/model'
import { QuoteDetailHeader } from './quote-detail/quote-detail-header'
import { QuoteGrid } from './quote-detail/quote-grid'
import { QuoteDraftGrid } from './quote-detail/quote-draft-grid'
import { QuoteTotalsCard } from './quote-detail/quote-totals-card'
import { ValidateDialog } from './quote-detail/validate-dialog'
import { CancelQuoteDialog } from './quote-detail/cancel-quote-dialog'
import { DeleteQuoteDialog } from './quote-detail/delete-quote-dialog'
import { QuoteActionDialog, type QuoteAction } from './quote-detail/quote-action-dialog'
import { QuoteInitialAllocation } from './quote-detail/quote-initial-allocation'

function buildValidatedRateKeys(referenceQuote: Quote): Set<string> {
  const keys = new Set<string>()
  for (const line of referenceQuote.lines) {
    keys.add(`${line.taskId}::${line.profileId}`)
  }
  return keys
}

function buildQuoteGrid(
  quote: Quote,
  phases: Phase[],
  frozenRateKeys: Set<string>,
  isChangeOrder: boolean,
  getTaskName: (id: string) => string,
  getPhaseName: (id: string) => string,
  getProfileName: (id: string) => string,
): QuoteGridRow[] {
  const taskToPhase = new Map<string, string>()
  for (const phase of phases) {
    for (const task of phase.tasks) taskToPhase.set(task.id, phase.id)
  }

  const phaseOrder: string[] = []
  const phaseMap = new Map<string, Map<string, Map<string, QuoteLine[]>>>()

  for (const line of quote.lines) {
    const phaseId = taskToPhase.get(line.taskId)
    if (!phaseId) continue

    if (!phaseMap.has(phaseId)) {
      phaseMap.set(phaseId, new Map())
      phaseOrder.push(phaseId)
    }
    const taskMap = phaseMap.get(phaseId)!

    if (!taskMap.has(line.taskId)) {
      taskMap.set(line.taskId, new Map())
    }
    const profileMap = taskMap.get(line.taskId)!

    if (!profileMap.has(line.profileId)) {
      profileMap.set(line.profileId, [])
    }
    profileMap.get(line.profileId)!.push(line)
  }

  const rows: QuoteGridRow[] = []
  let grandDays = 0
  let grandRevenue = 0
  let grandCost = 0

  for (const phaseId of phaseOrder) {
    const taskMap = phaseMap.get(phaseId)!
    let phaseDays = 0
    let phaseRevenue = 0
    let phaseCost = 0

    const taskRows: QuoteGridRow[] = []

    for (const [taskId, profileMap] of taskMap) {
      let taskDays = 0
      let taskRevenue = 0
      let taskCost = 0
      const profileRows: QuoteGridRow[] = []

      for (const [profileId, lines] of profileMap) {
        const days = lines.reduce((sum, line) => sum + line.days, 0)
        const revenue = lines.reduce((sum, line) => sum + line.revenueAmount, 0)
        const cost = lines.reduce((sum, line) => sum + line.budgetCostAmount, 0)
        const margin = revenue - cost
        const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0
        const sellRate = lines[0].sellRatePerDay
        const costRate = lines[0].costRateAssumptionPerDay
        const rateKey = `${taskId}::${profileId}`
        const isFrozen = isChangeOrder && frozenRateKeys.has(rateKey)

        profileRows.push({
          id: `prof-${taskId}-${profileId}`,
          kind: 'profile',
          phaseId,
          taskId,
          profileId,
          label: getProfileName(profileId),
          depth: 2,
          days,
          sellRatePerDay: sellRate,
          costRatePerDay: costRate,
          revenue,
          cost,
          margin,
          marginPct,
          isFrozenRate: isFrozen,
          lines,
        })

        taskDays += days
        taskRevenue += revenue
        taskCost += cost
      }

      const taskMargin = taskRevenue - taskCost
      taskRows.push({
        id: `task-${taskId}`,
        kind: 'task',
        phaseId,
        taskId,
        label: getTaskName(taskId),
        depth: 1,
        days: taskDays,
        sellRatePerDay: null,
        costRatePerDay: null,
        revenue: taskRevenue,
        cost: taskCost,
        margin: taskMargin,
        marginPct: taskRevenue > 0 ? (taskMargin / taskRevenue) * 100 : 0,
        isFrozenRate: false,
      })
      taskRows.push(...profileRows)

      phaseDays += taskDays
      phaseRevenue += taskRevenue
      phaseCost += taskCost
    }

    const phaseMargin = phaseRevenue - phaseCost
    rows.push({
      id: `phase-${phaseId}`,
      kind: 'phase',
      phaseId,
      label: getPhaseName(phaseId),
      depth: 0,
      days: phaseDays,
      sellRatePerDay: null,
      costRatePerDay: null,
      revenue: phaseRevenue,
      cost: phaseCost,
      margin: phaseMargin,
      marginPct: phaseRevenue > 0 ? (phaseMargin / phaseRevenue) * 100 : 0,
      isFrozenRate: false,
    })
    rows.push(...taskRows)

    grandDays += phaseDays
    grandRevenue += phaseRevenue
    grandCost += phaseCost
  }

  const grandMargin = grandRevenue - grandCost
  const avgSellRate = grandDays > 0 ? grandRevenue / grandDays : null
  const avgCostRate = grandDays > 0 ? grandCost / grandDays : null
  rows.push({
    id: 'grand-total',
    kind: 'grand-total',
    phaseId: '',
    label: 'Total général',
    depth: 0,
    days: grandDays,
    sellRatePerDay: avgSellRate,
    costRatePerDay: avgCostRate,
    revenue: grandRevenue,
    cost: grandCost,
    margin: grandMargin,
    marginPct: grandRevenue > 0 ? (grandMargin / grandRevenue) * 100 : 0,
    isFrozenRate: false,
  })

  return rows
}

export default function QuoteDetailPage() {
  const { id: projectId, quoteId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('pages')
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<QuoteAction | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const { data, isLoading, error } = useProject(projectId!)
  const { data: refData, isLoading: refLoading } = useReferenceData()
  const validateQuote = useValidateQuote(projectId!)
  const unvalidateQuote = useUnvalidateQuote(projectId!)
  const duplicateQuote = useDuplicateQuote(projectId!)
  const sendQuote = useSendQuote(projectId!)
  const rejectQuote = useRejectQuote(projectId!)
  const cancelQuote = useCancelQuote(projectId!)
  const reopenQuote = useReopenQuote(projectId!)
  const deleteQuote = useDeleteQuote(projectId!)

  if (isLoading || refLoading) return <LoadingState />
  if (error || !data || !refData) return <ErrorState />

  const quote = data.quotes.find((entry) => entry.id === quoteId)
  if (!quote) return <ErrorState message="Quote not found." variant="muted" />

  const getTaskName = (taskId: string) => data.flatTasks.find((task) => task.id === taskId)?.name ?? taskId
  const getPhaseName = (phaseId: string) => data.phases.find((phase) => phase.id === phaseId)?.name ?? phaseId
  const getProfileName = (profileId: string) => refData.profiles.find((profile) => profile.id === profileId)?.name ?? profileId

  const validatedQuotes = data.quotes.filter((entry) => entry.status === 'VALIDATED' && entry.id !== quoteId)
  const isChangeOrder = validatedQuotes.length > 0
  const frozenRateKeys = isChangeOrder ? buildValidatedRateKeys(validatedQuotes[0]) : new Set<string>()

  const isValidated = quote.status === 'VALIDATED'
  const isDraft = quote.status === 'DRAFT'

  function toggleCollapse(rowId: string) {
    setCollapsed((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  function handleValidate(effectiveAt: string) {
    const today = new Date().toISOString().split('T')[0]
    validateQuote.mutate({ quoteId: quoteId!, validatedAt: today, effectiveAt }, {
      onSuccess: () => {
        setValidateDialogOpen(false)
        toast.success(t('quotes.toasts.validated'), { description: t('quotes.toasts.validatedDesc') })
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleSend() {
    sendQuote.mutate(quoteId!, {
      onSuccess: () => {
        setActionDialog(null)
        toast.success(t('quotes.toasts.sent'))
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleReject() {
    rejectQuote.mutate(quoteId!, {
      onSuccess: () => {
        setActionDialog(null)
        toast.success(t('quotes.toasts.rejected'))
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleCancel() {
    cancelQuote.mutate(quoteId!, {
      onSuccess: () => {
        setCancelDialogOpen(false)
        toast.success(t('quotes.toasts.cancelled'))
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleReopen() {
    reopenQuote.mutate(quoteId!, {
      onSuccess: () => {
        setActionDialog(null)
        toast.success(t('quotes.toasts.reopened'))
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleUnvalidate() {
    unvalidateQuote.mutate(quoteId!, {
      onSuccess: () => {
        setActionDialog(null)
        toast.success(t('quotes.toasts.unvalidated'))
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  function handleDelete() {
    deleteQuote.mutate(quoteId!, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        toast.success(t('quotes.toasts.deleted'))
        void navigate(`/projects/${projectId}`)
      },
      onError: (err: Error) => toast.error(t('quotes.toasts.actionFailed'), { description: err.message }),
    })
  }

  const plannedDays = quote.lines.reduce((sum, line) => sum + line.days, 0)
  const canDelete = plannedDays === 0

  const gridRows = buildQuoteGrid(
    quote,
    data.phases,
    frozenRateKeys,
    isChangeOrder,
    getTaskName,
    getPhaseName,
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
    <VStack gap="xl">
      <QuoteDetailHeader
        quote={quote}
        canDelete={canDelete}
        onSend={() => setActionDialog('send')}
        onValidate={() => setValidateDialogOpen(true)}
        onUnvalidate={() => setActionDialog('unvalidate')}
        onReject={() => setActionDialog('reject')}
        onCancel={() => setCancelDialogOpen(true)}
        onReopen={() => setActionDialog('reopen')}
        onDuplicate={() => {
          duplicateQuote.mutate(quoteId!, {
            onSuccess: (newQuote) => {
              toast.success(`"${newQuote.title}" dupliqué`)
              void navigate(`/projects/${projectId}/quotes/${newQuote.id}`)
            },
            onError: () => toast.error('Échec de la duplication'),
          })
        }}
        onDelete={() => setDeleteDialogOpen(true)}
        onExport={() => toast.info('Export à venir')}
      />

      {isChangeOrder && isDraft && (
        <AlertBanner
          variant="warning"
          icon={<Info size={16} color="#d97706" />}
          title="Avenant"
          description="Complète le périmètre existant. Les TJM de vente correspondent aux taux du devis validé pour les mêmes combinaisons Tâche + Profil."
        />
      )}

      <Card variant="flush">
        {isDraft ? (
          <QuoteDraftGrid
            projectId={projectId!}
            quoteId={quoteId!}
            phases={data.phases}
            profiles={refData.profiles}
            lines={quote.lines}
            frozenRateKeys={frozenRateKeys}
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

      {isValidated && (
        <QuoteInitialAllocation
          projectId={projectId!}
          quoteId={quoteId!}
          taskNameOf={getTaskName}
          profileNameOf={getProfileName}
          employees={refData.employees}
        />
      )}
      {isDraft && <QuoteTotalsCard totalRow={{
        id: 'totals', kind: 'grand-total', phaseId: '', label: 'Total général', depth: 0,
        days: quote.lines.reduce((s, l) => s + l.days, 0),
        revenue: quote.lines.reduce((s, l) => s + l.revenueAmount, 0),
        cost: quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0),
        margin: quote.lines.reduce((s, l) => s + l.revenueAmount - l.budgetCostAmount, 0),
        marginPct: (() => { const rev = quote.lines.reduce((s, l) => s + l.revenueAmount, 0); const cost = quote.lines.reduce((s, l) => s + l.budgetCostAmount, 0); return rev > 0 ? ((rev - cost) / rev) * 100 : null })(),
        sellRatePerDay: null, costRatePerDay: null, isFrozenRate: false,
      }} />}

      <ValidateDialog
        open={validateDialogOpen}
        defaultEffectiveAt={quote.effectiveAt ?? new Date().toISOString().split('T')[0]}
        onConfirm={handleValidate}
        onClose={() => setValidateDialogOpen(false)}
      />
      <CancelQuoteDialog open={cancelDialogOpen} onConfirm={handleCancel} onClose={() => setCancelDialogOpen(false)} />
      <DeleteQuoteDialog open={deleteDialogOpen} onConfirm={handleDelete} onClose={() => setDeleteDialogOpen(false)} />
      <QuoteActionDialog
        action={actionDialog ?? 'send'}
        open={actionDialog !== null}
        onConfirm={() => {
          if (actionDialog === 'send') handleSend()
          else if (actionDialog === 'reject') handleReject()
          else if (actionDialog === 'reopen') handleReopen()
          else if (actionDialog === 'unvalidate') handleUnvalidate()
        }}
        onClose={() => setActionDialog(null)}
      />
    </VStack>
  )
}
