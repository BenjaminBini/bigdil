import type { ElementType } from 'react'
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
import type { UserRole } from '@/api/types'

export interface NavItem {
  /** i18n key under nav:items.* */
  labelKey: string
  to: string
  icon: ElementType
}

export interface NavGroup {
  /** i18n key under nav:groups.* */
  titleKey: string
  items: NavItem[]
}

export function buildNavGroups(role: UserRole): NavGroup[] {

  const groups: NavGroup[] = [
    {
      titleKey: 'main',
      items: [
        { labelKey: 'dashboard', to: '/dashboard', icon: LayoutDashboard },
        { labelKey: 'projects', to: '/projects', icon: FolderKanban },
        { labelKey: 'clients', to: '/clients', icon: Building2 },
      ],
    },
    {
      titleKey: 'reference',
      items: [
        { labelKey: 'profiles', to: '/profiles', icon: Briefcase },
        { labelKey: 'employees', to: '/employees', icon: Users },
      ],
    },
  ]

  const myWorkItems: NavItem[] = [{ labelKey: 'timesheets', to: '/timesheets', icon: Clock }]
  if (role === 'PM' || role === 'ADMIN') {
    myWorkItems.push({ labelKey: 'approvals', to: '/approvals', icon: CheckSquare })
  }
  if (role === 'PM' || role === 'FINANCE' || role === 'EXEC' || role === 'ADMIN') {
    myWorkItems.push({ labelKey: 'reports', to: '/reports', icon: BarChart3 })
  }
  groups.push({ titleKey: 'myWork', items: myWorkItems })

  if (role === 'ADMIN' || role === 'PM') {
    groups.push({
      titleKey: 'administration',
      items: [
        { labelKey: 'users', to: '/admin/users', icon: UserCog },
        { labelKey: 'settings', to: '/admin/settings', icon: Settings },
      ],
    })
  }

  return groups
}
