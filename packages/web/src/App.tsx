import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/app-layout'
import LoginPage from '@/components/pages/auth/login-page'
import ClientsPage from '@/components/pages/clients/clients-page'
import ClientDetailPage from '@/components/pages/clients/client-detail-page'
import ProfilesPage from '@/components/pages/profiles/profiles-page'
import EmployeesPage from '@/components/pages/employees/employees-page'
import WorkTablePage from '@/components/pages/projects/work-table-page'
import TimesheetsPage from '@/components/pages/timesheets/timesheets-page'
import ApprovalsPage from '@/components/pages/timesheets/approvals-page'
import ProjectTimesheetsPage from '@/components/pages/projects/project-timesheets-page'
import ProjectsPage from '@/components/pages/projects/projects-page'
import ProjectLayout from '@/components/pages/projects/project-layout'
import ProjectOverviewPage from '@/components/pages/projects/project-overview-page'
import QuotesPage from '@/components/pages/projects/quotes-page'
import QuoteDetailPage from '@/components/pages/projects/quote-detail-page'
import WbsPage from '@/components/pages/projects/wbs-page'
import SnapshotsPage from '@/components/pages/projects/snapshots-page'
import SnapshotDetailPage from '@/components/pages/projects/snapshot-detail-page'
import UsersPage from '@/components/pages/admin/users-page'
import SettingsPage from '@/components/pages/admin/settings-page'
import DashboardPage from '@/components/pages/dashboard-page'
import EmployeeDetailPage from '@/components/pages/employees/employee-detail-page'
import ProfileDetailPage from '@/components/pages/profiles/profile-detail-page'
import ReportsPage from '@/components/pages/reports/reports-page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated routes — wrapped in AppLayout (sidebar + topbar) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/profiles/:id" element={<ProfileDetailPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/timesheets" element={<TimesheetsPage />} />
            <Route path="/timesheets/approvals" element={<ApprovalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Projects list */}
            <Route path="/projects" element={<ProjectsPage />} />

            {/* Project nested routes (layout with tab nav + KPI strip) */}
            <Route path="/projects/:id" element={<ProjectLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ProjectOverviewPage />} />
              <Route path="wbs" element={<WbsPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="quotes/:quoteId" element={<QuoteDetailPage />} />
              <Route path="work-table" element={<WorkTablePage />} />
              <Route path="timesheets" element={<ProjectTimesheetsPage />} />
              <Route path="snapshots" element={<SnapshotsPage />} />
              <Route path="snapshots/:snapshotId" element={<SnapshotDetailPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
