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
    <div className={cn('flex min-w-[140px] flex-col justify-center px-5 py-3', dim && 'opacity-60')}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <span
        className={cn(
          'mt-1 text-xl font-semibold leading-none tracking-tight tabular-nums',
          highlight ? 'text-green-600 dark:text-green-400' : 'text-foreground',
        )}
      >
        {value}
      </span>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
