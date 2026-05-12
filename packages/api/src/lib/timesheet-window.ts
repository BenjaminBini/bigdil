import { prisma } from '@bigdil/db'
import { getPeriodSlicesForDateRange } from './period-utils.js'

export const GLOBAL_TIMESHEET_WINDOW_ID = 'global'

export async function getGlobalTimesheetWindow() {
  const existing = await prisma.globalTimesheetWindow.findUnique({
    where: { id: GLOBAL_TIMESHEET_WINDOW_ID },
  })
  if (existing) return existing

  const today = new Date().toISOString().slice(0, 10)
  const currentSlice = getPeriodSlicesForDateRange(today, today, 'WEEKLY')[0]

  return prisma.globalTimesheetWindow.create({
    data: {
      id: GLOBAL_TIMESHEET_WINDOW_ID,
      openPeriodKey: currentSlice?.periodKey ?? `${new Date().getUTCFullYear()}M${new Date().getUTCMonth() + 1}`,
    },
  })
}

export async function requireGlobalTimesheetWindow() {
  const window = await getGlobalTimesheetWindow()
  if (!window) {
    throw Object.assign(new Error('Global timesheet window not configured'), { status: 500 })
  }
  return window
}
