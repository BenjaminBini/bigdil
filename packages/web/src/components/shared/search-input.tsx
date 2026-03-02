import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SearchInputProps = Omit<ComponentProps<typeof Input>, 'className'>

/**
 * Input with a search icon overlay. Wraps the standard Input
 * with proper left-padding for the icon.
 */
export function SearchInput(props: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <Input className="pl-8" {...props} />
    </div>
  )
}
