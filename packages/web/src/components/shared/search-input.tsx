import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const maxWidthMap = { sm: 'max-w-xs', md: 'max-w-sm', lg: 'max-w-md' } as const

type SearchInputProps = Omit<ComponentProps<typeof Input>, 'className'> & {
  maxWidth?: keyof typeof maxWidthMap
}

/**
 * Input with a search icon overlay. Wraps the standard Input
 * with proper left-padding for the icon.
 */
export function SearchInput({ maxWidth, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', maxWidth && maxWidthMap[maxWidth])}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-8" {...props} />
    </div>
  )
}
