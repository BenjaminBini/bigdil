import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  /** Fill percentage (0–100) */
  percent: number
  /** Tailwind bg color class for the fill (default: bg-green-500) */
  color?: string
  className?: string
  /** 'sm' renders a thinner bar (h-1) */
  size?: 'sm'
}

/**
 * A simple horizontal progress bar.
 */
export function ProgressBar({ percent, color = 'bg-green-500', className, size }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <div className={cn(size === 'sm' ? 'h-1' : 'h-2', 'overflow-hidden rounded-full bg-gray-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
