import { z } from 'zod'

export const workTablePatchSchema = z.object({
  taskId: z.string(),
  profileId: z.string(),
  employeeId: z.string().nullable().optional(),
  periodId: z.string(),
  days: z.number().min(0),
})

export const workTableAssignSchema = z.object({
  taskId: z.string(),
  profileId: z.string(),
  employeeId: z.string(),
})

export const timesheetCreateSchema = z.object({
  employeeId: z.string(),
  projectId: z.string(),
  periodId: z.string(),
  taskId: z.string(),
  profileId: z.string(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().positive(),
  notes: z.string().optional(),
})

export const timesheetUpdateSchema = z.object({
  days: z.number().positive().optional(),
  notes: z.string().optional(),
})
