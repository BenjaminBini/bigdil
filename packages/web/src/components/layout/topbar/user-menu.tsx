import { useNavigate } from 'react-router'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User as UserType } from '@/api/types'

const currentUser: UserType = {
  id: 'u1',
  email: 'marie.dupont@acme-consulting.fr',
  role: 'PM',
  name: 'Marie Dupont',
  employeeId: null,
}

export function UserMenu() {
  const navigate = useNavigate()
  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleLabel: Record<string, string> = {
    ADMIN: 'Admin',
    PM: 'Project Manager',
    CONSULTANT: 'Consultant',
    FINANCE: 'Finance',
    EXEC: 'Executive',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {initials}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
            {currentUser.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{currentUser.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {roleLabel[currentUser.role] ?? currentUser.role}
            </span>
            <span className="text-xs font-normal text-muted-foreground truncate">
              {currentUser.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onSelect={() => navigate('/profile')}>
          <User className="size-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2"
          onSelect={() => {
            console.log('logout')
          }}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
