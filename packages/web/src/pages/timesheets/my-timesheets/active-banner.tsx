import { AlertBanner } from '@/components/shared/alert-banner'

interface ActiveBannerProps {
  projectName: string
}

export function ActiveBanner({ projectName }: ActiveBannerProps) {
  return (
    <AlertBanner
      variant="success"
      icon={<div className="size-2 shrink-0 rounded-full bg-green-500" />}
      title={`${projectName} - OPEN`}
      className="px-4 py-3"
    />
  )
}
