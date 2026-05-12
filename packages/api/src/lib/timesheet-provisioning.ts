import { prisma } from '@bigdil/db'
import { getPeriodDates, parsePeriodSliceKey } from './period-utils.js'

// Provision a Timesheet (and pre-populated TaskTimesheet rows) for a single
// (employee, periodKey) tuple. Idempotent — relies on the unique constraint
// on (employeeId, periodKey).
//
// Pre-population rule: for every active AssignmentSlot the employee owns
// that has a PlannedDay matching `periodKey`, create one TaskTimesheet
// with days=0 (employee fills the actuals later). We pin workDate to the
// first day of the slice so the row sorts predictably.
export async function ensureTimesheetForEmployee(
  employeeId: string,
  periodKey: string,
): Promise<{ id: string; created: boolean; entriesCreated: number }> {
  const existing = await prisma.timesheet.findUnique({
    where: { employeeId_periodKey: { employeeId, periodKey } },
  })
  if (existing) {
    return { id: existing.id, created: false, entriesCreated: 0 }
  }

  const plannedDays = await prisma.plannedDay.findMany({
    where: {
      periodKey,
      assignmentSlot: { employeeId },
    },
    include: { assignmentSlot: true },
  })

  // periodKey is "monthCode" for monthly slices or "monthCode__weekCode" for
  // weekly ones; getPeriodDates only accepts a single code so unwrap first.
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const workDate = new Date(`${getPeriodDates(weekCode ?? monthCode).startDate}T00:00:00Z`)

  const timesheet = await prisma.timesheet.create({
    data: {
      employeeId,
      periodKey,
      status: 'DRAFT',
      taskTimesheets: {
        create: plannedDays.map((pd) => ({
          assignmentSlotId: pd.assignmentSlotId,
          workDate,
          days: 0,
        })),
      },
    },
  })

  return { id: timesheet.id, created: true, entriesCreated: plannedDays.length }
}

// Make sure a TaskTimesheet exists for a given (employee, slot) inside the
// employee's Timesheet for `periodKey`. Idempotent — used to keep the open
// Timesheet in sync when PlannedDays land mid-period (assignment / planning
// edits done after the window already advanced past the seeding moment).
//
// Only safe to call for the currently-open period: editing past periods is
// forbidden, and future periods get pre-populated when the window advances.
export async function ensureTaskTimesheetForSlot(input: {
  employeeId: string
  assignmentSlotId: string
  periodKey: string
}): Promise<{ created: boolean; taskTimesheetId: string }> {
  const { employeeId, assignmentSlotId, periodKey } = input

  // Upsert the parent Timesheet so the call works even if no `/me` GET has
  // pre-provisioned it yet for this employee.
  const timesheet = await prisma.timesheet.upsert({
    where: { employeeId_periodKey: { employeeId, periodKey } },
    update: {},
    create: { employeeId, periodKey, status: 'DRAFT' },
  })

  const existing = await prisma.taskTimesheet.findFirst({
    where: { timesheetId: timesheet.id, assignmentSlotId },
    select: { id: true },
  })
  if (existing) return { created: false, taskTimesheetId: existing.id }

  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const workDate = new Date(`${getPeriodDates(weekCode ?? monthCode).startDate}T00:00:00Z`)

  const created = await prisma.taskTimesheet.create({
    data: { timesheetId: timesheet.id, assignmentSlotId, workDate, days: 0 },
  })
  return { created: true, taskTimesheetId: created.id }
}

// Remove a stale untouched TaskTimesheet for a (slot, period) pair when the
// underlying PlannedDay disappears. Skips deletion if the consultant already
// logged real work or notes — that data wins.
export async function pruneTaskTimesheetIfUntouched(input: {
  employeeId: string
  assignmentSlotId: string
  periodKey: string
}): Promise<{ deleted: boolean }> {
  const { employeeId, assignmentSlotId, periodKey } = input
  const timesheet = await prisma.timesheet.findUnique({
    where: { employeeId_periodKey: { employeeId, periodKey } },
    select: { id: true, status: true },
  })
  if (!timesheet || timesheet.status !== 'DRAFT') return { deleted: false }

  const entry = await prisma.taskTimesheet.findFirst({
    where: { timesheetId: timesheet.id, assignmentSlotId },
  })
  if (!entry) return { deleted: false }
  if (entry.days !== 0 || entry.notes !== '') return { deleted: false }

  await prisma.taskTimesheet.delete({ where: { id: entry.id } })
  return { deleted: true }
}

// Provision Timesheets for every active employee for a given periodKey.
// Used when the global window advances to a new open slice.
export async function ensureTimesheetsForAllActiveEmployees(
  periodKey: string,
): Promise<{ totalCreated: number; totalEntriesCreated: number }> {
  const employees = await prisma.employee.findMany({
    where: { active: true },
    select: { id: true },
  })

  let totalCreated = 0
  let totalEntriesCreated = 0
  for (const employee of employees) {
    const result = await ensureTimesheetForEmployee(employee.id, periodKey)
    if (result.created) {
      totalCreated += 1
      totalEntriesCreated += result.entriesCreated
    }
  }

  return { totalCreated, totalEntriesCreated }
}
