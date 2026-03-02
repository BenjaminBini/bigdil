import type { QuoteLine } from '@/api/types'

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
