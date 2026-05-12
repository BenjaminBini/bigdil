import { Outlet } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ImpersonationBanner } from './impersonation-banner'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { PeriodCalendarBar } from './topbar/period-calendar-bar'

/**
 * Root shell layout.
 *
 * Structure:
 *   ┌─────────┬─────────────────────────────┐
 *   │         │ Topbar (fixed h-14)         │
 *   │         │ Period calendar strip       │
 *   │ Sidebar ├─────────────────────────────┤
 *   │ (fixed) │ <Outlet /> (scrollable)     │
 *   └─────────┴─────────────────────────────┘
 *
 * The sidebar and topbar are sticky. The content area scrolls independently.
 */
export function AppLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Fixed-width sidebar — full height */}
        <Sidebar />

        {/* Right column: topbar + scrollable content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ImpersonationBanner />

          {/* Topbar */}
          <Topbar />

          {/* Global period calendar */}
          <PeriodCalendarBar />

          {/* Page content */}
          <main className="main-texture min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

