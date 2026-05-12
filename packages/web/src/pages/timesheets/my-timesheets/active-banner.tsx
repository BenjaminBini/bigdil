import { AlertBanner } from '@/components/shared/alert-banner'
import { StatusDot } from '@/components/shared/status-dot'

interface ActiveBannerProps {
  periodLabel: string
}

export function ActiveBanner({ periodLabel }: ActiveBannerProps) {
  return (
    <AlertBanner
      variant="success"
      icon={<StatusDot />}
      title={`${periodLabel} - OPEN`}
      size="compact"
    />
  )
}
