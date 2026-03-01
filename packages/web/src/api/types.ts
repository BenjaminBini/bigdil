// API response types — mirrors mock.ts interfaces with numbers (API converts numerics)

export type UserRole = 'ADMIN' | 'PM' | 'CONSULTANT' | 'FINANCE' | 'EXEC'
export type ProjectStatus = 'DRAFT' | 'WAITING_APPROVAL' | 'TO_PLAN' | 'IN_PROGRESS' | 'COMPLETED'
export type PeriodStatus = 'FUTURE' | 'OPEN' | 'CONSOLIDATION' | 'FROZEN'
export type QuoteStatus = 'DRAFT' | 'SENT' | 'VALIDATED' | 'REJECTED'
export type TaskStatus = 'planned' | 'active' | 'done'
export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  employeeId: string | null
}

export interface Client {
  id: string
  name: string
  contactName: string
  contactEmail: string
  address: string
}

export interface Profile {
  id: string
  name: string
  defaultSellRatePerDay: number
  defaultCostRatePerDay: number
}

export interface Employee {
  id: string
  name: string
  active: boolean
  currentCostRatePerDay: number
  costRateHistory: { validFrom: string; validTo: string | null; costRatePerDay: number }[]
}

export interface Project {
  id: string
  clientId: string
  name: string
  currency: string
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
}

export interface ProjectListItem extends Project {
  clientName: string | null
  contractValue: number
}

export interface Task {
  id: string
  projectId: string
  parentTaskId: string | null
  name: string
  sortOrder: number
  status: TaskStatus
  children?: Task[]
}

export interface Period {
  id: string
  projectId: string
  periodNumber: number
  startDate: string
  endDate: string
  status: PeriodStatus
  frozenAt: string | null
}

export interface QuoteLine {
  id: string
  quoteId: string
  taskId: string
  profileId: string
  days: number
  sellRatePerDay: number
  costRateAssumptionPerDay: number
  revenueAmount: number
  budgetCostAmount: number
}

export interface Quote {
  id: string
  projectId: string
  title: string
  status: QuoteStatus
  effectiveAt: string | null
  validatedAt: string | null
  lines: QuoteLine[]
}

export interface WorkTableCell {
  taskId: string
  profileId: string
  employeeId: string | null
  periodId: string
  days: number
  isActual: boolean
}

export interface ProfileTaskPeriodStart {
  taskId: string
  profileId: string
  periodId: string
  remainingAtStart: number
  soldAtStart: number
}

export interface TimesheetEntry {
  id: string
  employeeId: string
  projectId: string
  periodId: string
  taskId: string
  profileId: string
  workDate: string
  days: number
  status: TimesheetStatus
  approvedAt: string | null
  appliedCostRatePerDay: number | null
  appliedCostAmount: number | null
  appliedSellRatePerDay: number | null
  appliedSellAmount: number | null
  notes: string
}

export interface SnapshotMetrics {
  contractValue: number
  actualCostToDate: number
  etcCost: number
  eacCost: number
  marginForecast: number
  executedDaysPeriod: number
  producedExecutionValuePeriod: number
  producedExecutionValueToDate: number
  netBurnValuePeriod: number
}

export interface Snapshot {
  id: string
  projectId: string
  periodId: string
  periodNumber: number
  snapshotAt: string
  frozenAt: string
  closedBy: string
  notes: string
  metrics: SnapshotMetrics | null
  scopeLines: SnapshotScopeLine[]
  workTableRows: SnapshotWorkTableRow[]
}

export interface SnapshotScopeLine {
  snapshotId: string
  taskId: string
  profileId: string
  baselineDaysTotalAsofSnapshot: number
  sellRatePerDay: number
  costRateAssumptionPerDay: number
  baselineRevenueTotal: number
  baselineBudgetCostTotal: number
}

export interface SnapshotWorkTableRow {
  snapshotId: string
  periodId: string
  periodNumber: number
  periodStatus: PeriodStatus
  taskId: string
  profileId: string
  employeeId: string | null
  plannedDays: number
  actualDays: number | null
}

// API response shapes
export interface ProjectDetail extends Project {
  clientName: string | null
  contractValue: number
  tasks: Task[]
  flatTasks: Task[]
  periods: Period[]
  quotes: Quote[]
}

export interface WorkTableData {
  periods: Period[]
  tasks: Task[]
  cells: WorkTableCell[]
  quotes: Quote[]
  periodStarts: ProfileTaskPeriodStart[]
}

export interface ReferenceData {
  profiles: Profile[]
  employees: Employee[]
  clients: Client[]
}

export interface DashboardData {
  kpis: {
    totalContractValue: number
    totalMarginForecast: number
    activeProjects: number
    overdueApprovals: number
  }
  activeProjectsList: Array<{
    id: string
    name: string
    status: ProjectStatus
    clientName: string | null
  }>
  recentActivity: Array<{
    id: string
    projectId: string
    periodNumber: number
    snapshotAt: string
    notes: string
  }>
  alerts: {
    periodsNeedingClosure: Array<{
      periodId: string
      periodNumber: number
      projectId: string
      projectName: string
    }>
    overdueApprovals: number
  }
}

export interface EmployeeDetail extends Employee {
  assignments: Array<{
    projectId: string
    projectName: string
    taskId: string
    taskName: string
    profileId: string
    profileName: string
    periodId: string
    periodNumber: number
    days: number
  }>
  timesheets: TimesheetEntry[]
}

export interface ProfileDetail extends Profile {
  usage: Array<{
    quoteId: string
    quoteTitle: string
    quoteStatus: QuoteStatus
    projectId: string
    projectName: string
    days: number
    sellRatePerDay: number
    costRateAssumptionPerDay: number
    revenueAmount: number
  }>
  activeAssignments: Array<{
    employeeId: string
    employeeName: string
    projectName: string
    days: number
  }>
  appliedRates: Array<{
    costRate: number
    sellRate: number
  }>
}

export interface FinancialReportRow {
  projectId: string
  projectName: string
  clientName: string | null
  contractValue: number
  eacCost: number
  marginForecast: number
  marginPercent: number
  actualCostToDate: number
  producedValueToDate: number
}

export interface UtilizationReportRow {
  employeeId: string
  employeeName: string
  periods: Array<{
    periodNumber: number
    days: number
    utilization: number
  }>
}
