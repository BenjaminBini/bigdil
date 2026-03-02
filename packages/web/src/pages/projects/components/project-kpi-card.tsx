import { KpiCard, type KpiCardProps } from '@/components/shared/kpi-card'

export interface ProjectKpiCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  dim?: boolean
}

export function ProjectKpiCard({ label, value, sub, highlight, dim }: ProjectKpiCardProps) {
  const variant: KpiCardProps['variant'] = highlight
    ? 'highlight'
    : dim
      ? 'dim'
      : 'default'

  return (
    <KpiCard
      label={label}
      value={value}
      description={sub}
      variant={variant}
      className="min-w-[130px] bg-white px-4 py-3"
    />
  )
}
