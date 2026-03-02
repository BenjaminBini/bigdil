interface ActiveBadgeProps {
  active: boolean
}

export function ActiveBadge({ active }: ActiveBadgeProps) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
          : 'inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
