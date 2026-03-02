interface ActiveBannerProps {
  projectName: string
}

export function ActiveBanner({ projectName }: ActiveBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <div className="size-2 shrink-0 rounded-full bg-green-500" />
      <span className="text-sm font-medium text-green-800">{projectName} - OPEN</span>
    </div>
  )
}
