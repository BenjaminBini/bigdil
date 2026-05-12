import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type {
  ProjectListItem, ProjectDetail, WorkTableData, Snapshot, Quote, QuoteLine,
  Timesheet, ReferenceData, DashboardData,
  EmployeeDetail, ProfileDetail, Profile, Phase, Task, Client, Employee,
  FinancialReportRow, UtilizationReportRow, GlobalTimesheetWindow,
  User, UserRole, CurrentUserSession, AssignableSlot, CellDetail,
} from '../types'

// ── Query Keys ─────────────────────────────────

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  workTable: (projectId: string) => ['projects', projectId, 'work-table'] as const,
  snapshots: (projectId: string) => ['projects', projectId, 'snapshots'] as const,
  snapshot: (projectId: string, snapshotId: string) => ['projects', projectId, 'snapshots', snapshotId] as const,
  projectTimesheets: (projectId: string) => ['projects', projectId, 'timesheets'] as const,
  myTimesheets: ['timesheets', 'me'] as const,
  approvals: ['timesheets', 'approvals'] as const,
  allTimesheets: ['timesheets', 'all'] as const,
  referenceData: ['reference-data'] as const,
  dashboard: ['dashboard'] as const,
  employee: (id: string) => ['employees', id] as const,
  profile: (id: string) => ['profiles', id] as const,
  financialReport: ['reports', 'financial'] as const,
  utilizationReport: ['reports', 'utilization'] as const,
  users: ['users'] as const,
  currentUser: ['auth', 'me'] as const,
}

// ── Hooks ──────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiFetch<ProjectListItem[]>('/api/projects'),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiFetch<ProjectDetail>(`/api/projects/${id}`),
    enabled: !!id,
  })
}

export function useWorkTable(projectId: string) {
  return useQuery({
    queryKey: queryKeys.workTable(projectId),
    queryFn: () => apiFetch<WorkTableData>(`/api/projects/${projectId}/work-table`),
    enabled: !!projectId,
  })
}

export function useSnapshots(projectId: string) {
  return useQuery({
    queryKey: queryKeys.snapshots(projectId),
    queryFn: () => apiFetch<Snapshot[]>(`/api/projects/${projectId}/snapshots`),
    enabled: !!projectId,
  })
}

export function useCreateSnapshot(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (monthCode: string) =>
      apiFetch<Snapshot>(`/api/projects/${projectId}/snapshots`, {
        method: 'POST',
        body: JSON.stringify({ monthCode }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.snapshots(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function useSnapshot(projectId: string, snapshotId: string) {
  return useQuery({
    queryKey: queryKeys.snapshot(projectId, snapshotId),
    queryFn: () => apiFetch<Snapshot>(`/api/projects/${projectId}/snapshots/${snapshotId}`),
    enabled: !!projectId && !!snapshotId,
  })
}

export function useProjectTimesheets(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectTimesheets(projectId),
    queryFn: () => apiFetch<Timesheet[]>(`/api/projects/${projectId}/timesheets`),
    enabled: !!projectId,
  })
}

export function useMyTimesheets() {
  return useQuery({
    queryKey: queryKeys.myTimesheets,
    queryFn: () => apiFetch<Timesheet[]>('/api/timesheets/me'),
  })
}

export function useMyAssignableSlots() {
  return useQuery({
    queryKey: ['timesheets', 'me', 'assignable-slots'] as const,
    queryFn: () => apiFetch<AssignableSlot[]>('/api/timesheets/me/assignable-slots'),
  })
}

// Drives the work-table cell detail popover. Disabled until enabled=true so
// nothing fires before the popover opens.
export function useCellDetail(
  params: { taskId: string; profileId: string; employeeId: string; periodKey: string } | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['cell-detail', params?.taskId, params?.profileId, params?.employeeId, params?.periodKey] as const,
    queryFn: () => {
      if (!params) throw new Error('params required')
      const qs = new URLSearchParams(params).toString()
      return apiFetch<CellDetail>(`/api/timesheets/cell-detail?${qs}`)
    },
    enabled: enabled && !!params,
  })
}

// Save a single per-day cell from the work-table popover. Uses the same
// upsert endpoint the consultant's schedule grid uses.
export function useUpsertCellEntry(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, ...body }: { timesheetId: string; assignmentSlotId: string; workDate: string; days: number; notes?: string }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // Both the work-table and the cell-detail popover need fresh data.
      void queryClient.invalidateQueries({ queryKey: queryKeys.workTable(projectId) })
      void queryClient.invalidateQueries({ queryKey: ['cell-detail'] })
    },
  })
}

export function useApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals,
    queryFn: () => apiFetch<Timesheet[]>('/api/timesheets/approvals'),
  })
}

// All timesheets across employees, regardless of status — used by approvals
// page to render the "past approvals" section (everything before the open
// week, any status).
export function useAllTimesheets() {
  return useQuery({
    queryKey: queryKeys.allTimesheets,
    queryFn: () => apiFetch<Timesheet[]>('/api/timesheets/all'),
  })
}

export function useReferenceData() {
  return useQuery({
    queryKey: queryKeys.referenceData,
    queryFn: () => apiFetch<ReferenceData>('/api/reference-data'),
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiFetch<DashboardData>('/api/dashboard'),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: () => apiFetch<EmployeeDetail>(`/api/employees/${id}`),
    enabled: !!id,
  })
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.profile(id),
    queryFn: () => apiFetch<ProfileDetail>(`/api/profiles/${id}`),
    enabled: !!id,
  })
}

export function useFinancialReport() {
  return useQuery({
    queryKey: queryKeys.financialReport,
    queryFn: () => apiFetch<FinancialReportRow[]>('/api/reports/financial'),
  })
}

export function useUtilizationReport() {
  return useQuery({
    queryKey: queryKeys.utilizationReport,
    queryFn: () => apiFetch<UtilizationReportRow[]>('/api/reports/utilization'),
  })
}

// ── Mutations (Phase C) ────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { clientId: string; name: string; currency: string; startDate?: string | null; endDate?: string | null }) =>
      apiFetch<ProjectListItem>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.projects }) },
  })
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; currency?: string; startDate?: string | null; endDate?: string | null }) =>
      apiFetch(`/api/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) =>
      apiFetch(`/api/employees/${employeeId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData })
    },
  })
}

export function useAddEmployeeRate(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { validFrom: string; costRatePerDay: number }) =>
      apiFetch(`/api/employees/${employeeId}/rates`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; defaultSellRatePerDay: number; defaultCostRatePerDay: number }) =>
      apiFetch<Profile>('/api/profiles', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; defaultSellRatePerDay?: number; defaultCostRatePerDay?: number }) =>
      apiFetch<Profile>(`/api/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/profiles/${id}`, { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useCreatePhase(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiFetch<Phase>(`/api/projects/${projectId}/phases`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useUpdatePhase(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ phaseId, ...data }: { phaseId: string; name?: string }) =>
      apiFetch<Phase>(`/api/projects/${projectId}/phases/${phaseId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useDeletePhase(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (phaseId: string) =>
      apiFetch(`/api/projects/${projectId}/phases/${phaseId}`, { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ phaseId, ...data }: { phaseId: string; name: string; status?: string }) =>
      apiFetch<Task>(`/api/projects/${projectId}/phases/${phaseId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, ...data }: { taskId: string; name?: string; status?: string }) =>
      apiFetch<Task>(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useAssignEmployee(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { taskId: string; profileId: string; employeeId: string }) =>
      apiFetch(`/api/projects/${projectId}/work-table/assign`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.workTable(projectId) }) },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) =>
      apiFetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useValidateQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ quoteId, validatedAt, effectiveAt }: { quoteId: string; validatedAt: string; effectiveAt: string }) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ validatedAt, effectiveAt }),
      }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useCloseProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch(`/api/projects/${projectId}/close`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useReopenProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch(`/api/projects/${projectId}/reopen`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export interface ClientWriteInput {
  name: string
  contactName: string
  contactEmail: string
  addressLine1: string
  addressLine2?: string | null
  postalCode: string
  city: string
  country: string
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClientWriteInput) =>
      apiFetch<Client>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ClientWriteInput>) =>
      apiFetch<Client>(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useCreateQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string }) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes`, { method: 'POST', body: JSON.stringify({ ...data, lines: [] }) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useAddQuoteLine(projectId: string, quoteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { taskId: string; profileId: string; days: number; sellRatePerDay: number; costRateAssumptionPerDay: number }) =>
      apiFetch<QuoteLine>(`/api/projects/${projectId}/quotes/${quoteId}/lines`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useUpdateQuoteLine(projectId: string, quoteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lineId, ...data }: { lineId: string; days?: number; sellRatePerDay?: number; costRateAssumptionPerDay?: number }) =>
      apiFetch<QuoteLine>(`/api/projects/${projectId}/quotes/${quoteId}/lines/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (updatedLine) => {
      queryClient.setQueryData<ProjectDetail>(queryKeys.project(projectId), (old) => {
        if (!old) return old
        return {
          ...old,
          quotes: old.quotes.map(q =>
            q.id !== quoteId ? q : {
              ...q,
              lines: q.lines.map(l => l.id !== updatedLine.id ? l : updatedLine),
            }
          ),
        }
      })
    },
  })
}

export function useDeleteQuoteLine(projectId: string, quoteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) =>
      apiFetch<{ ok: boolean }>(`/api/projects/${projectId}/quotes/${quoteId}/lines/${lineId}`, { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useDuplicateQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/duplicate`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useDeleteQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<{ ok: boolean }>(`/api/projects/${projectId}/quotes/${quoteId}`, { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useCancelQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/cancel`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useSendQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/send`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useReopenQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/reopen`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useRejectQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/reject`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; currentCostRatePerDay: number }) =>
      apiFetch<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData })
      // A linked User row is auto-provisioned on the backend — refresh the
      // users list so the "Incarner" button can find it.
      void queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

export function useUpdateCell(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { taskId: string; profileId: string; employeeId?: string; periodCode: string; days: number }) =>
      apiFetch(`/api/projects/${projectId}/work-table`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workTable(projectId) })
    },
  })
}

// Add a TaskTimesheet to an editable Timesheet (DRAFT/REJECTED).
export function useAddTaskTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, ...data }: {
      timesheetId: string
      assignmentSlotId: string
      workDate: string
      days: number
      notes?: string
    }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

// Update a single TaskTimesheet's days/notes.
export function useUpdateTaskTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, entryId, ...data }: {
      timesheetId: string
      entryId: string
      days?: number
      notes?: string
    }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries/${entryId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

// Remove a TaskTimesheet from an editable Timesheet.
export function useDeleteTaskTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, entryId }: { timesheetId: string; entryId: string }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries/${entryId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

// Upsert the Congés row for a given workDate inside a Timesheet.
// `days` must be 0 (clear), 0.5 (half day) or 1 (full day).
export function useUpsertLeaveDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, workDate, days }: { timesheetId: string; workDate: string; days: number }) =>
      apiFetch(`/api/timesheets/${timesheetId}/leave`, {
        method: 'POST',
        body: JSON.stringify({ workDate, days }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

// Submit the whole Timesheet (DRAFT/REJECTED → SUBMITTED).
export function useSubmitTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (timesheetId: string) =>
      apiFetch(`/api/timesheets/${timesheetId}/submit`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
    },
  })
}

// Approve the whole Timesheet (SUBMITTED → APPROVED, freezes per-entry rates).
export function useApproveTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (timesheetId: string) =>
      apiFetch(`/api/timesheets/${timesheetId}/approve`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

// Reject the whole Timesheet (SUBMITTED → REJECTED).
export function useRejectTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timesheetId, reason }: { timesheetId: string; reason?: string }) =>
      apiFetch(`/api/timesheets/${timesheetId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
    },
  })
}

interface AdvanceWindowResponse {
  window: GlobalTimesheetWindow
  from: string
  to: string
  sameMonth: boolean
  timesheetsCreated: number
  taskTimesheetsCreated: number
}

export function useAdvanceTimesheetWindow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<AdvanceWindowResponse>('/api/timesheet-window/advance', { method: 'POST' }),
    onSuccess: () => {
      // Window shift affects every period-derived view in the app.
      void queryClient.invalidateQueries()
    },
  })
}

export function useTimesheetWindow() {
  return useQuery<GlobalTimesheetWindow>({
    queryKey: ['timesheetWindow'],
    queryFn: () => apiFetch<GlobalTimesheetWindow>('/api/timesheet-window'),
  })
}

// ── Users + Auth ────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiFetch<User[]>('/api/users'),
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiFetch<CurrentUserSession>('/api/auth/me'),
    staleTime: 30_000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; role: UserRole; employeeId: string | null }) =>
      apiFetch<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.users }) },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; email?: string; role?: UserRole; employeeId?: string | null }) =>
      apiFetch<User>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.users }) },
  })
}

export function useImpersonate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<CurrentUserSession>('/api/auth/impersonate', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      // Effective user changed — invalidate everything so the whole UI refetches under the new identity.
      void queryClient.invalidateQueries()
    },
  })
}

export function useStopImpersonating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<CurrentUserSession>('/api/auth/impersonate', { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries()
    },
  })
}
