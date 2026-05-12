import { useNavigate } from 'react-router'
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

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  PM: 'Chef de projet',
  CONSULTANT: 'Consultant',
  FINANCE: 'Finance',
  EXEC: 'Direction',
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu() {
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
      onSuccess: () => toast.success('Stopped impersonating'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
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
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            <span className="text-xs font-normal text-muted-foreground truncate">
              {user.email}
            </span>
            {isImpersonating && (
              <span className="mt-1 text-xs font-medium text-amber-500">
                Impersonating — real user: {session.realUser.name}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onSelect={() => navigate('/profile')}>
          <User className="size-4" />
          Mon profil
        </DropdownMenuItem>
        {isImpersonating && (
          <DropdownMenuItem className="gap-2" onSelect={handleStopImpersonating}>
            <UserCog className="size-4" />
            Stop impersonating
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
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
