import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/lib/theme'
import { AppLayout } from '@/components/layout/app-layout'
import LoginPage from '@/pages/auth/login-page'
import ClientsPage from '@/pages/clients/clients-page'
import ClientLayout from '@/pages/clients/client-layout'
import ClientOverviewPage from '@/pages/clients/client-overview-page'
import ClientProjectsPage from '@/pages/clients/client-projects-page'
import ProfilesPage from '@/pages/profiles/profiles-page'
import EmployeesPage from '@/pages/employees/employees-page'
import WorkTablePage from '@/pages/projects/work-table-page'
import TimesheetsPage from '@/pages/timesheets/timesheets-page'
import ApprovalsPage from '@/pages/timesheets/approvals-page'
import ProjectTimesheetsPage from '@/pages/projects/project-timesheets-page'
import ProjectsPage from '@/pages/projects/projects-page'
import ProjectLayout from '@/pages/projects/project-layout'
import ProjectOverviewPage from '@/pages/projects/project-overview-page'
import QuotesPage from '@/pages/projects/quotes-page'
import QuoteDetailPage from '@/pages/projects/quote-detail-page'
import WbsPage from '@/pages/projects/wbs-page'
import SnapshotsPage from '@/pages/projects/snapshots-page'
import SnapshotDetailPage from '@/pages/projects/snapshot-detail-page'
import UsersPage from '@/pages/admin/users-page'
import SettingsPage from '@/pages/admin/settings-page'
import DashboardPage from '@/pages/dashboard-page'
import EmployeeDetailPage from '@/pages/employees/employee-detail-page'
import ProfileDetailPage from '@/pages/profiles/profile-detail-page'
import ReportsPage from '@/pages/reports/reports-page'

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
    <ThemeProvider>
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
            {/* Client nested routes (layout with tab nav) */}
            <Route path="/clients/:id" element={<ClientLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ClientOverviewPage />} />
              <Route path="projects" element={<ClientProjectsPage />} />
            </Route>
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/profiles/:id" element={<ProfileDetailPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/timesheets" element={<TimesheetsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
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
    </ThemeProvider>
  )
}
