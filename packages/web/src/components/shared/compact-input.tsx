import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InputProps = ComponentProps<typeof Input>

/** Small centered numeric input for table cells. */
export function CompactInput({ className, ...props }: Omit<InputProps, 'size'>) {
  return <Input size="sm" className={cn('w-14 text-center', className)} {...props} />
}
