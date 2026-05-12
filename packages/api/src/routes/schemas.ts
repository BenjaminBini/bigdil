import { z } from 'zod'

export const workTablePatchSchema = z.object({
  taskId: z.string(),
  profileId: z.string(),
  employeeId: z.string().nullable().optional(),
  periodCode: z.string().regex(/^\d{4}M\d{1,2}(__\d{4}W\d{1,2})?$/),
  days: z.number().min(0),
})

export const workTableAssignSchema = z.object({
  taskId: z.string(),
  profileId: z.string(),
  employeeId: z.string(),
})

export const taskTimesheetCreateSchema = z.object({
  assignmentSlotId: z.string(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().nonnegative(),
  notes: z.string().optional(),
})

export const taskTimesheetUpdateSchema = z.object({
  days: z.number().nonnegative().optional(),
  notes: z.string().optional(),
})

export const timesheetRejectSchema = z.object({
  reason: z.string().optional(),
})

export const leaveDayUpsertSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // 0 clears the leave row for that day; 0.5 = half day; 1 = full day.
  days: z.number().refine((v) => v === 0 || v === 0.5 || v === 1, {
    message: 'days must be 0, 0.5, or 1',
  }),
})
