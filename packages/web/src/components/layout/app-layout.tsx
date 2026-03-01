import { Outlet } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

/**
 * Root shell layout.
 *
 * Structure:
 *   ┌─────────┬─────────────────────────────┐
 *   │         │ Topbar (fixed h-14)         │
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
          {/* Topbar */}
          <Topbar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
