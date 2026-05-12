import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/api/hooks'
import { cn } from '@/lib/utils'
import { SidebarNavGroup } from './sidebar/nav-group'
import { buildNavGroups } from './sidebar/navigation'

export function Sidebar() {
  const { t } = useTranslation('common')
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useCurrentUser()
  const navGroups = buildNavGroups(session?.user.role ?? 'CONSULTANT')

  return (
    <aside className={cn('textured flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200', collapsed ? 'w-14' : 'w-56')}>
      <div className={cn('flex h-14 items-center border-b px-3', collapsed ? 'justify-center' : 'gap-2.5')}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <span className="text-sm font-bold">B</span>
        </div>
        {!collapsed && <span className="text-base font-semibold tracking-tight">BigDil</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <SidebarNavGroup key={group.titleKey} group={group} collapsed={collapsed} />
        ))}
      </nav>

      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={cn('flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', collapsed && 'justify-center')}
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? (
            <ChevronRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="size-4 shrink-0" />
              <span>{t('sidebar.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
