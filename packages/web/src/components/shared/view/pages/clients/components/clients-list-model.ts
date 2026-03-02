import type { Client } from '@/api/types'

export type ClientSortKey = 'name' | 'activeProjects' | 'contractValue' | 'marginForecast' | 'lastActivity'
export type SortDir = 'asc' | 'desc'

export interface ClientListRow {
  client: Client
  activeProjects: number
  totalProjects: number
  contractValue: number
  marginForecast: number | null
  lastActivity: string | null
}
