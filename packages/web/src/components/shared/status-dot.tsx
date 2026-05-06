import { cn } from '@/lib/utils'

interface StatusDotProps {
  color?: string
}

/** Small colored indicator dot — size-2 rounded-full */
export function StatusDot({ color = 'bg-green-500' }: StatusDotProps) {
  return <div className={cn('size-2 rounded-full', color)} />
}
