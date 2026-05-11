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
  label: string
  to: string
  icon: ElementType
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export function buildNavGroups(role: UserRole): NavGroup[] {

  const groups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Projets', to: '/projects', icon: FolderKanban },
        { label: 'Clients', to: '/clients', icon: Building2 },
      ],
    },
    {
      title: 'Référentiel',
      items: [
        { label: 'Profils', to: '/profiles', icon: Briefcase },
        { label: 'Collaborateurs', to: '/employees', icon: Users },
      ],
    },
  ]

  const myWorkItems: NavItem[] = [{ label: 'Feuilles de temps', to: '/timesheets', icon: Clock }]
  if (role === 'PM' || role === 'ADMIN') {
    myWorkItems.push({ label: 'Approbations', to: '/approvals', icon: CheckSquare })
  }
  if (role === 'PM' || role === 'FINANCE' || role === 'EXEC' || role === 'ADMIN') {
    myWorkItems.push({ label: 'Rapports', to: '/reports', icon: BarChart3 })
  }
  groups.push({ title: 'Mon travail', items: myWorkItems })

  if (role === 'ADMIN' || role === 'PM') {
    groups.push({
      title: 'Administration',
      items: [
        { label: 'Utilisateurs', to: '/admin/users', icon: UserCog },
        { label: 'Paramètres', to: '/admin/settings', icon: Settings },
      ],
    })
  }

  return groups
}

