import type { NavGroup as SidebarNavGroupType } from './navigation'
import { SidebarNavItem } from './nav-item'

interface SidebarNavGroupProps {
  group: SidebarNavGroupType
  collapsed: boolean
}

export function SidebarNavGroup({ group, collapsed }: SidebarNavGroupProps) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          {group.title}
        </p>
      )}
      {collapsed && <div className="mx-auto mb-1 h-px w-6 bg-sidebar-foreground/10" />}
      <ul className="space-y-0.5 px-2">
        {group.items.map((item) => (
          <li key={item.to}>
            <SidebarNavItem item={item} collapsed={collapsed} />
          </li>
        ))}
      </ul>
    </div>
  )
}
