import {
  BarChart3,
  Building2,
  Briefcase,
  CheckSquare,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import type { User } from '@/api/types'

const currentUser: User = {
  id: 'u1',
  email: 'marie.dupont@acme-consulting.fr',
  role: 'PM',
  name: 'Marie Dupont',
  employeeId: null,
}

export interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

export interface NavGroup {
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

  const myWorkItems: NavItem[] = [{ label: 'Timesheets', to: '/timesheets', icon: Clock }]
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

export const navGroups = buildNavGroups()
