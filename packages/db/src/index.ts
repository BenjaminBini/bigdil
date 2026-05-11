export { prisma } from './client.js'
export type { PrismaClient } from '../generated/prisma/client.js'

// Re-export generated model types
export type {
  Client,
  User,
  Profile,
  Employee,
  EmployeeCostRate,
  Project,
  Task,
  Quote,
  QuoteLine,
  AssignmentSlot,
  PlannedDay,
  Timesheet,
  TaskTimesheet,
  LeaveDay,
  ProfileTaskPeriodStart,
  Snapshot,
  SnapshotMetrics,
  SnapshotScopeLine,
  SnapshotWorkRow,
  GlobalTimesheetWindow,
  MonthFreeze,
  AuditLog,
} from '../generated/prisma/client.js'

// Re-export generated enums
export type {
  UserRole,
  SnapshotPeriodStatus,
  QuoteStatus,
  TaskStatus,
  TimesheetStatus,
  Currency,
  AuditAction,
} from '../generated/prisma/enums.js'
