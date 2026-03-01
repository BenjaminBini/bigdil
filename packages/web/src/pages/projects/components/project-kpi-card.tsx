import { cn } from '@/lib/utils'

export interface ProjectKpiCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  dim?: boolean
}

export function ProjectKpiCard({ label, value, sub, highlight, dim }: ProjectKpiCardProps) {
  return (
    <div className={cn(
      'flex flex-col gap-1 rounded-lg border px-4 py-3 min-w-[130px] bg-white',
      highlight && 'border-green-200 bg-green-50',
      dim && 'opacity-60',
    )}>
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</span>
      <span className={cn(
        'text-lg font-semibold leading-tight tabular-nums',
        highlight ? 'text-green-700' : 'text-gray-900',
        dim && 'text-gray-400',
      )}>
        {value}
      </span>
      {sub && (
        <span className={cn(
          'text-xs',
          highlight ? 'text-green-600' : 'text-gray-500',
        )}>
          {sub}
        </span>
      )}
    </div>
  )
}
