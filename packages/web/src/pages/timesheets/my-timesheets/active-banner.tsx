import { AlertBanner } from '@/components/shared/alert-banner'
import { StatusDot } from '@/components/shared/status-dot'

interface ActiveBannerProps {
  projectName: string
}

export function ActiveBanner({ projectName }: ActiveBannerProps) {
  return (
    <AlertBanner
      variant="success"
      icon={<StatusDot />}
      title={`${projectName} - OPEN`}
      size="compact"
    />
  )
}
