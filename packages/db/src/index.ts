export { prisma } from './client.js'
export type { PrismaClient } from '../generated/prisma/client.js'

// Re-export generated types
export type {
  Client,
  User,
  Profile,
  Employee,
  EmployeeCostRate,
  Project,
  Task,
  Period,
  Quote,
  QuoteLine,
  PlannedDay,
  TimesheetEntry,
  ProfileTaskPeriodStart,
  Snapshot,
  SnapshotMetrics,
  SnapshotScopeLine,
  SnapshotWorkRow,
} from '../generated/prisma/client.js'

export type {
  UserRole,
  ProjectStatus,
  PeriodStatus,
  QuoteStatus,
  TaskStatus,
  TimesheetStatus,
} from '../generated/prisma/enums.js'
