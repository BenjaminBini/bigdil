import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InputProps = Omit<ComponentProps<typeof Input>, 'size'>

/** Small centered numeric input for table cells. */
export function CompactInput({ className, ...props }: InputProps) {
  return <Input size="sm" className={cn('w-14 text-center', className)} {...props} />
}
