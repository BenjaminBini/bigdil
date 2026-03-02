import type { Quote, QuoteLine, Task } from '@/api/types'

export type QuoteRowKind = 'phase' | 'task' | 'profile' | 'grand-total'

export interface QuoteGridRow {
  id: string
  kind: QuoteRowKind
  phaseId: string
  taskId?: string
  profileId?: string
  label: string
  depth: number
  days: number
  sellRatePerDay: number | null
  costRatePerDay: number | null
  revenue: number
  cost: number
  margin: number
  marginPct: number | null
  isFrozenRate: boolean
  lines?: QuoteLine[]
}

export function buildQuoteGrid(
  quote: Quote,
  flatTasks: Task[],
  frozenRateKeys: Set<string>,
  isChangeOrder: boolean,
  getTaskName: (id: string) => string,
  getProfileName: (id: string) => string,
): QuoteGridRow[] {
  function getPhase(taskId: string): Task | null {
    const task = flatTasks.find(t => t.id === taskId)
    if (!task) return null
    if (!task.parentTaskId) return task
    return flatTasks.find(t => t.id === task.parentTaskId) ?? null
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
        const days = lines.reduce((s, l) => s + l.days, 0)
        const revenue = lines.reduce((s, l) => s + l.revenueAmount, 0)
        const cost = lines.reduce((s, l) => s + l.budgetCostAmount, 0)
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

export function buildValidatedRateKeys(referenceQuote: Quote): Set<string> {
  const keys = new Set<string>()
  for (const line of referenceQuote.lines) {
    keys.add(`${line.taskId}::${line.profileId}`)
  }
  return keys
}
