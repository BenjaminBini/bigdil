import { useState } from 'react'
import { NavLink } from 'react-router'
import {
  BarChart3,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { User } from '@/api/types'

// Auth is deferred — hardcoded current user for now
const currentUser: User = {
  id: 'u1',
  email: 'marie.dupont@acme-consulting.fr',
  role: 'PM',
  name: 'Marie Dupont',
  employeeId: null,
}

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

interface NavGroup {
  title: string
  items: NavItem[]
}

function buildNavGroups(): NavGroup[] {
  const { role } = currentUser

  const groups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Projects', to: '/projects', icon: FolderKanban },
        { label: 'Clients', to: '/clients', icon: Building2 },
      ],
    },
    {
      title: 'Reference',
      items: [
        { label: 'Profiles', to: '/profiles', icon: Briefcase },
        { label: 'Employees', to: '/employees', icon: Users },
      ],
    },
  ]

  // Show My Work for everyone — PMs get both timesheets and approvals
  const myWorkItems: NavItem[] = []
  myWorkItems.push({ label: 'Timesheets', to: '/timesheets', icon: Clock })
  if (role === 'PM' || role === 'ADMIN') {
    myWorkItems.push({ label: 'Approvals', to: '/timesheets/approvals', icon: CheckSquare })
  }
  if (role === 'PM' || role === 'FINANCE' || role === 'EXEC' || role === 'ADMIN') {
    myWorkItems.push({ label: 'Reports', to: '/reports', icon: BarChart3 })
  }
  groups.push({ title: 'My Work', items: myWorkItems })

  if (role === 'ADMIN' || role === 'PM') {
    groups.push({
      title: 'Admin',
      items: [
        { label: 'Users', to: '/admin/users', icon: UserCog },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ],
    })
  }

  return groups
}

const navGroups = buildNavGroups()

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const Icon = item.icon

  const linkContent = (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2',
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground flex flex-col border-r transition-all duration-200',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b px-3',
          collapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-xs font-bold">B</span>
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">BigDil</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                {group.title}
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-1 h-px w-6 bg-sidebar-foreground/10" />
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => (
                <li key={item.to}>
                  <SidebarNavItem item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="size-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
