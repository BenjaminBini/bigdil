import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const icon = theme === 'system'
    ? <Monitor className="size-4" />
    : resolvedTheme === 'dark'
      ? <Moon className="size-4" />
      : <Sun className="size-4" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Changer le thème">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="gap-2" onSelect={() => setTheme('light')}>
          <Sun className="size-4" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => setTheme('dark')}>
          <Moon className="size-4" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => setTheme('system')}>
          <Monitor className="size-4" />
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
