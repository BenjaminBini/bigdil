// API response types — mirrors mock.ts interfaces with numbers (API converts numerics)

export type UserRole = 'ADMIN' | 'PM' | 'CONSULTANT' | 'FINANCE' | 'EXEC'
export type PeriodStatus = 'FUTURE' | 'OPEN' | 'CONSOLIDATION' | 'FROZEN'
export type QuoteStatus = 'DRAFT' | 'SENT' | 'VALIDATED' | 'REJECTED' | 'CANCELLED'
export type TaskStatus = 'planned' | 'active' | 'done'
export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  employeeId: string | null
}

export interface CurrentUserSession {
  user: User
  realUser: User
  isImpersonating: boolean
}

export interface Client {
  id: string
  name: string
  contactName: string
  contactEmail: string
  addressLine1: string
  addressLine2: string | null
  postalCode: string
  city: string
  country: string
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
  assignedProjectCount: number
  costRateHistory: { validFrom: string; validTo: string | null; costRatePerDay: number }[]
}

export interface Project {
  id: string
  clientId: string
  name: string
  currency: string
  startDate: string | null
  endDate: string | null
  closedAt: string | null
  isActive: boolean
}

export interface ProjectListItem extends Project {
  clientName: string | null
  contractValue: number
}

export interface Task {
  id: string
  phaseId: string
  name: string
  sortOrder: number
  status: TaskStatus
}

export interface Phase {
  id: string
  projectId: string
  name: string
  sortOrder: number
  tasks: Task[]
}

export interface PeriodInfo {
  code: string
  periodKey: string
  monthCode: string
  weekCode: string | null
  startDate: string
  endDate: string
  label: string
  groupCode: string
  groupLabel: string
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
  sentAt: string | null
  effectiveAt: string | null
  validatedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
  lines: QuoteLine[]
}

export interface QuoteInitialAllocationEntry {
  id: string
  employeeId: string
  days: number
}

export interface QuoteAllocationLine {
  lineId: string
  taskId: string
  profileId: string
  quotedDays: number
  allocatedDays: number
  balanced: boolean
  lockedBy: string | null
  allocations: QuoteInitialAllocationEntry[]
}

export interface QuoteAllocationsResponse {
  quoteId: string
  status: QuoteStatus
  lines: QuoteAllocationLine[]
}

export interface WorkTableCell {
  taskId: string
  profileId: string
  employeeId: string | null
  periodCode: string
  periodKey: string
  monthCode: string
  weekCode: string | null
  days: number
  isActual: boolean
}

export interface ProfileTaskPeriodStart {
  taskId: string
  profileId: string
  periodCode: string
  remainingAtStart: number
  soldAtStart: number
}

export interface CellDetail {
  slotId: string
  timesheetId: string | null
  bundleStatus: TimesheetStatus | null
  periodStatus: PeriodStatus
  editable: boolean
  entries: Array<{
    id: string
    workDate: string
    days: number
    notes: string
  }>
}

export interface AssignableSlot {
  id: string
  projectId: string
  projectName: string
  taskId: string
  taskName: string
  profileId: string
  profileName: string
}

export interface AssignmentSlotRef {
  id: string
  projectId: string
  taskId: string
  profileId: string
  employeeId: string | null
  task?: { id: string; name: string }
  project?: { id: string; name: string }
}

export interface TaskTimesheet {
  id: string
  timesheetId: string
  assignmentSlotId: string
  workDate: string
  days: number
  notes: string
  appliedCostRatePerDay: number | null
  appliedCostAmount: number | null
  appliedSellRatePerDay: number | null
  appliedSellAmount: number | null
  assignmentSlot?: AssignmentSlotRef
}

export interface LeaveDay {
  id: string
  timesheetId: string
  workDate: string
  days: number
}

export interface Timesheet {
  id: string
  employeeId: string
  periodKey: string
  status: TimesheetStatus
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  taskTimesheets: TaskTimesheet[]
  leaveDays: LeaveDay[]
  windowStatus?: 'OPEN' | 'CONSOLIDATION' | 'FROZEN' | 'FUTURE'
}

// Flattened denormalized shape — TaskTimesheet rows merged with their parent
// Timesheet's status/period/lifecycle fields. Used by project-level views,
// employee detail, snapshots, and the period-close checklist where callers
// want a single flat row instead of the (Timesheet, TaskTimesheet) pair.
export interface ProjectTaskTimesheet {
  id: string
  timesheetId: string
  employeeId: string
  assignmentSlotId: string
  projectId: string
  taskId: string
  profileId: string
  periodCode: string
  periodKey: string
  workDate: string
  days: number
  notes: string
  status: TimesheetStatus
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  appliedCostRatePerDay?: number | null
  appliedCostAmount?: number | null
  appliedSellRatePerDay?: number | null
  appliedSellAmount?: number | null
  monthCode?: string
  weekCode?: string | null
  windowStatus?: 'OPEN' | 'CONSOLIDATION' | 'FROZEN' | 'FUTURE'
}

// Legacy alias — most pages still import `TimesheetEntry` and expect the
// flattened shape. New code should prefer `Timesheet` + `TaskTimesheet`
// for the aggregate model.
export type TimesheetEntry = ProjectTaskTimesheet

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
  periodCode: string
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
  periodCode: string
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
  phases: Phase[]
  flatTasks: Task[]
  periods: PeriodInfo[]
  quotes: Quote[]
}

export interface PreviousSnapshotRaf {
  taskId: string
  profileId: string
  days: number
}

export interface WorkTableData {
  periods: PeriodInfo[]
  phases: Phase[]
  tasks: Task[]
  cells: WorkTableCell[]
  quotes: Quote[]
  periodStarts: ProfileTaskPeriodStart[]
  /** RAF (remaining days) per (task, profile) from the snapshot taken just
   *  before the current CONSOLIDATION month. Empty when no prior snapshot
   *  exists — consumers fall back to quotedDays for that case. */
  previousSnapshotRaf: PreviousSnapshotRaf[]
  /** monthCode of the snapshot that produced `previousSnapshotRaf`, if any. */
  previousSnapshotMonthCode: string | null
  /** ISO date the snapshot was taken (drives "source" tooltips). */
  previousSnapshotAt: string | null
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
    isActive: boolean
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
    periodCode: string
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

export interface GlobalTimesheetWindow {
  id: string
  openPeriodKey: string
  updatedAt: string
}
