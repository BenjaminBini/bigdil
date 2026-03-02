import type { Employee, Profile, Quote } from '@/api/types'
import type { GridRow, MarginInsightEmployee } from '@/lib/work-table/types'

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const item of items) map.set(item.id, item)
  return map
}

export function buildMarginInsight(
  rows: GridRow[],
  quotes: Quote[],
  profiles: Profile[],
  employees: Employee[],
): {
  employees: MarginInsightEmployee[]
  totalEtcCost: number
  totalContractValue: number
  marginForecast: number
  marginPercent: number
} {
  const profileMap = indexById(profiles)
  const employeeMap = indexById(employees)

  const insightMap = new Map<string, MarginInsightEmployee>()
  let totalEtcCost = 0
  let actualCostToDate = 0

  for (const row of rows) {
    if (row.kind !== 'employee') continue

    if (row.etcCost !== null) totalEtcCost += row.etcCost

    if (row.employeeId) {
      const employee = employeeMap.get(row.employeeId)
      if (employee) actualCostToDate += row.totalActual * employee.currentCostRatePerDay
    } else if (row.profileId) {
      const profile = profileMap.get(row.profileId)
      if (profile) actualCostToDate += row.totalActual * profile.defaultCostRatePerDay
    }

    if (!row.employeeId || row.totalRemaining === 0) continue
    const employee = employeeMap.get(row.employeeId)
    if (!employee) continue

    const profile = profileMap.get(row.profileId!)
    const assumedCostRate = profile?.defaultCostRatePerDay ?? 0
    const actualCostRate = employee.currentCostRatePerDay
    const rateImpact = actualCostRate - assumedCostRate
    const etcCost = row.totalRemaining * actualCostRate
    const totalImpact = rateImpact * row.totalRemaining

    const key = `${row.employeeId}-${row.profileId}`
    if (insightMap.has(key)) {
      const existing = insightMap.get(key)!
      existing.remainingDays += row.totalRemaining
      existing.etcCost += etcCost
      existing.totalImpact += totalImpact
    } else {
      insightMap.set(key, {
        employeeId: row.employeeId,
        employeeName: employee.name,
        profileId: row.profileId!,
        profileName: profile?.name ?? row.profileId!,
        remainingDays: row.totalRemaining,
        actualCostRate,
        assumedCostRate,
        rateImpact,
        totalImpact,
        etcCost,
      })
    }
  }

  const employeeRows = [...insightMap.values()].sort((a, b) => b.remainingDays - a.remainingDays)

  let totalContractValue = 0
  for (const quote of quotes) {
    if (quote.status !== 'VALIDATED') continue
    for (const line of quote.lines) {
      totalContractValue += line.revenueAmount
    }
  }

  const eacCost = actualCostToDate + totalEtcCost
  const marginForecast = totalContractValue - eacCost
  const marginPercent = totalContractValue > 0 ? (marginForecast / totalContractValue) * 100 : 0

  return {
    employees: employeeRows,
    totalEtcCost,
    totalContractValue,
    marginForecast,
    marginPercent,
  }
}
