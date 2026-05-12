import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LogOut, User, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser, useStopImpersonating } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu() {
  const { t } = useTranslation(['common', 'statuses'])
  const navigate = useNavigate()
  const { data: session } = useCurrentUser()
  const stopImpersonating = useStopImpersonating()

  if (!session) {
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
        …
      </Button>
    )
  }

  const { user, isImpersonating } = session
  const initials = initialsFor(user.name)

  function handleStopImpersonating() {
    stopImpersonating.mutate(undefined, {
      onSuccess: () => toast.success(t('common:user.stoppedImpersonating')),
      onError: (err) => toast.error(err instanceof Error ? err.message : t('common:user.failed')),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {initials}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {t(`statuses:role.${user.role}`, { defaultValue: user.role })}
            </span>
            <span className="text-xs font-normal text-muted-foreground truncate">
              {user.email}
            </span>
            {isImpersonating && (
              <span className="mt-1 text-xs font-medium text-amber-500">
                {t('common:user.impersonatingAs', { name: session.realUser.name })}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onSelect={() => navigate('/profile')}>
          <User className="size-4" />
          {t('common:user.myProfile')}
        </DropdownMenuItem>
        {isImpersonating && (
          <DropdownMenuItem className="gap-2" onSelect={handleStopImpersonating}>
            <UserCog className="size-4" />
            {t('common:user.stopImpersonating')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2"
          onSelect={() => {
            console.log('logout')
          }}
        >
          <LogOut className="size-4" />
          {t('common:user.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
