import type { Client, ProjectListItem } from '@/api/types'

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

export function buildClientRows(clients: Client[], projects: ProjectListItem[]): ClientListRow[] {
  return clients.map((client) => {
    const clientProjects = projects.filter((project) => project.clientId === client.id)
    const contractValue = clientProjects.reduce((sum, project) => sum + project.contractValue, 0)
    const lastActivity =
      clientProjects
        .map((project) => project.startDate)
        .filter((date): date is string => date !== null)
        .sort()
        .at(-1) ?? null

    return {
      client,
      activeProjects: clientProjects.filter((project) => project.status === 'IN_PROGRESS').length,
      totalProjects: clientProjects.length,
      contractValue,
      marginForecast: null,
      lastActivity,
    }
  })
}

export function filterAndSortClientRows(
  rows: ClientListRow[],
  search: string,
  sortKey: ClientSortKey,
  sortDir: SortDir,
): ClientListRow[] {
  return rows
    .filter((row) => row.client.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.client.name.localeCompare(b.client.name)
          break
        case 'activeProjects':
          cmp = a.activeProjects - b.activeProjects
          break
        case 'contractValue':
          cmp = a.contractValue - b.contractValue
          break
        case 'marginForecast':
          cmp = (a.marginForecast ?? 0) - (b.marginForecast ?? 0)
          break
        case 'lastActivity':
          cmp = (a.lastActivity ?? '').localeCompare(b.lastActivity ?? '')
          break
      }

      return sortDir === 'asc' ? cmp : -cmp
    })
}
