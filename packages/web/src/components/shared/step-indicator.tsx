import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepIndicatorProps {
  /** Labels for each step */
  labels: string[]
  /** Current step number (1-based) */
  current: number
  className?: string
}

/**
 * A horizontal wizard step indicator with numbered circles and labels.
 * Steps before `current` are shown as completed (green check), the current
 * step is highlighted, and future steps are dimmed.
 */
export function StepIndicator({ labels, current, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      {labels.map((label, idx) => {
        const step = idx + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2',
                  done && 'bg-green-600 border-green-600 text-white',
                  active && 'bg-gray-900 border-gray-900 text-white',
                  !done && !active && 'bg-white border-gray-300 text-gray-400',
                )}
              >
                {done ? <CheckCircle2 className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs whitespace-nowrap',
                  active ? 'text-gray-900 font-medium' : 'text-gray-400',
                )}
              >
                {label}
              </span>
            </div>
            {idx < labels.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 mx-1 mb-4',
                  done ? 'bg-green-500' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
