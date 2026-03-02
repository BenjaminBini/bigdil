import { Badge } from '@/components/ui/badge'

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={
        active
          ? 'border-green-200 bg-green-100 text-green-800'
          : 'border-red-200 bg-red-100 text-red-800'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}
