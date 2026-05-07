import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type {
  ProjectListItem, ProjectDetail, WorkTableData, Snapshot, Quote,
  TimesheetEntry, ReferenceData, DashboardData,
  EmployeeDetail, ProfileDetail, Profile, Task, Client, Employee,
  FinancialReportRow, UtilizationReportRow,
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
  referenceData: ['reference-data'] as const,
  dashboard: ['dashboard'] as const,
  employee: (id: string) => ['employees', id] as const,
  profile: (id: string) => ['profiles', id] as const,
  financialReport: ['reports', 'financial'] as const,
  utilizationReport: ['reports', 'utilization'] as const,
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
    queryFn: () => apiFetch<TimesheetEntry[]>(`/api/projects/${projectId}/timesheets`),
    enabled: !!projectId,
  })
}

export function useMyTimesheets() {
  return useQuery({
    queryKey: queryKeys.myTimesheets,
    queryFn: () => apiFetch<TimesheetEntry[]>('/api/timesheets/me'),
  })
}

export function useApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals,
    queryFn: () => apiFetch<TimesheetEntry[]>('/api/timesheets/approvals'),
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

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; status?: string; parentTaskId?: string | null }) =>
      apiFetch<Task>(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
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
    mutationFn: (quoteId: string) =>
      apiFetch(`/api/projects/${projectId}/quotes/${quoteId}/validate`, { method: 'POST' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) },
  })
}

export function useUpdateProjectStatus(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/api/projects/${projectId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; contactName: string; contactEmail: string; address: string }) =>
      apiFetch<Client>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; contactName?: string; contactEmail?: string; address?: string }) =>
      apiFetch<Client>(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useCreateQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      effectiveAt?: string | null
      lines: Array<{ taskId: string; profileId: string; days: number; sellRatePerDay: number; costRateAssumptionPerDay: number }>
    }) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes`, { method: 'POST', body: JSON.stringify(data) }),
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

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; currentCostRatePerDay: number }) =>
      apiFetch<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.referenceData }) },
  })
}

export function useUpdateCell(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { taskId: string; profileId: string; employeeId?: string; periodId: string; days: number }) =>
      apiFetch(`/api/projects/${projectId}/work-table`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workTable(projectId) })
    },
  })
}

export function useCreateTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      employeeId: string; projectId: string; periodId: string;
      taskId: string; profileId: string; workDate: string; days: number; notes?: string
    }) =>
      apiFetch('/api/timesheets', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
    },
  })
}

export function useUpdateTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; days?: number; notes?: string }) =>
      apiFetch(`/api/timesheets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/timesheets/${id}/submit`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
    },
  })
}

export function useApproveTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/timesheets/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTimesheets })
    },
  })
}

export function useRejectTimesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/timesheets/${id}/reject`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals })
    },
  })
}

export function useOpenPeriod(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (periodId: string) =>
      apiFetch(`/api/projects/${projectId}/periods/${periodId}/open`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function useStartConsolidation(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (periodId: string) =>
      apiFetch(`/api/projects/${projectId}/periods/${periodId}/start-consolidation`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function useFreezePeriod(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (periodId: string) =>
      apiFetch(`/api/projects/${projectId}/periods/${periodId}/freeze`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.snapshots(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.workTable(projectId) })
    },
  })
}
