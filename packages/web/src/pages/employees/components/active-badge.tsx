import { Badge } from '@/components/ui/badge'

interface ActiveBadgeProps {
  active: boolean
}

export function ActiveBadge({ active }: ActiveBadgeProps) {
  if (active) {
    return (
      <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
        Active
      </Badge>
    )
  }

  return (
    <Badge className="border-red-200 bg-red-100 text-red-800 hover:bg-red-100">
      Inactive
    </Badge>
  )
}
