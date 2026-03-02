import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/app-layout'
import LoginPage from '@/components/shared/view/pages/auth/login-page'
import ClientsPage from '@/components/shared/view/pages/clients/clients-page'
import ClientDetailPage from '@/components/shared/view/pages/clients/client-detail-page'
import ProfilesPage from '@/components/shared/view/pages/profiles/profiles-page'
import EmployeesPage from '@/components/shared/view/pages/employees/employees-page'
import WorkTablePage from '@/pages/projects/work-table-page'
import TimesheetsPage from '@/components/shared/view/pages/timesheets/timesheets-page'
import ApprovalsPage from '@/components/shared/view/pages/timesheets/approvals-page'
import ProjectTimesheetsPage from '@/components/shared/view/pages/projects/project-timesheets-page'
import ProjectsPage from '@/components/shared/view/pages/projects/projects-page'
import ProjectLayout from '@/components/shared/view/pages/projects/project-layout'
import ProjectOverviewPage from '@/components/shared/view/pages/projects/project-overview-page'
import QuotesPage from '@/components/shared/view/pages/projects/quotes-page'
import QuoteDetailPage from '@/components/shared/view/pages/projects/quote-detail-page'
import WbsPage from '@/components/shared/view/pages/projects/wbs-page'
import SnapshotsPage from '@/components/shared/view/pages/projects/snapshots-page'
import SnapshotDetailPage from '@/components/shared/view/pages/projects/snapshot-detail-page'
import UsersPage from '@/components/shared/view/pages/admin/users-page'
import SettingsPage from '@/components/shared/view/pages/admin/settings-page'
import DashboardPage from '@/components/shared/view/pages/dashboard-page'
import EmployeeDetailPage from '@/components/shared/view/pages/employees/employee-detail-page'
import ProfileDetailPage from '@/components/shared/view/pages/profiles/profile-detail-page'
import ReportsPage from '@/components/shared/view/pages/reports/reports-page'

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
