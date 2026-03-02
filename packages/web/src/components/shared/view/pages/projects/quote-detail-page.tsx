/* eslint-disable max-lines */
import { useState } from 'react'
import { useParams } from 'react-router'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { useProject, useReferenceData } from '@/api/hooks'
import type { Quote, QuoteLine, Task } from '@/api/types'
import type { QuoteGridRow } from './quote-detail/model'
import { QuoteDetailHeader } from './quote-detail/quote-detail-header'
import { QuoteGrid } from './quote-detail/quote-grid'
import { QuoteTotalsCard } from './quote-detail/quote-totals-card'
import { ValidateDialog } from './quote-detail/validate-dialog'

function buildValidatedRateKeys(referenceQuote: Quote): Set<string> {
  const keys = new Set<string>()
  for (const line of referenceQuote.lines) {
    keys.add(`${line.taskId}::${line.profileId}`)
  }
  return keys
}

function buildQuoteGrid(
  quote: Quote,
  flatTasks: Task[],
  frozenRateKeys: Set<string>,
  isChangeOrder: boolean,
  getTaskName: (id: string) => string,
  getProfileName: (id: string) => string,
): QuoteGridRow[] {
  function getPhase(taskId: string): Task | null {
    const task = flatTasks.find((candidate) => candidate.id === taskId)
    if (!task) return null
    if (!task.parentTaskId) return task
    return flatTasks.find((candidate) => candidate.id === task.parentTaskId) ?? null
  }

  const phaseOrder: string[] = []
  const phaseMap = new Map<string, Map<string, Map<string, QuoteLine[]>>>()

  for (const line of quote.lines) {
    const phase = getPhase(line.taskId)
    if (!phase) continue
    const phaseId = phase.id

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
      label: getTaskName(phaseId),
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
    label: 'Grand Total',
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
