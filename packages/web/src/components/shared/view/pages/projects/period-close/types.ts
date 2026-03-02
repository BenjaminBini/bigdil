export interface ForecastRow {
  key: string
  taskId: string
  profileId: string
  employeeId: string | null
  periodDays: Record<string, number>
}
