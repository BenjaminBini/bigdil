import { Mail, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBlock } from '@/components/shared/icon-block'
import type { Client } from '@/api/types'

interface ClientOverviewCardProps {
  client: Client
}

export function ClientOverviewCard({ client }: ClientOverviewCardProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IconBlock icon={<User className="size-4" />} label="Contact Name" value={<p className="text-sm font-medium text-gray-900">{client.contactName}</p>} />
          <IconBlock
            icon={<Mail className="size-4" />}
            label="Email"
            value={
              <a href={`mailto:${client.contactEmail}`} className="text-sm font-medium text-blue-600 hover:underline">
                {client.contactEmail}
              </a>
            }
          />
          <IconBlock
            icon={<MapPin className="size-4" />}
            label="Address"
            className="sm:col-span-2"
            value={<p className="text-sm font-medium text-gray-900">{client.address}</p>}
          />
        </div>
      </CardContent>
    </Card>
  )
}
