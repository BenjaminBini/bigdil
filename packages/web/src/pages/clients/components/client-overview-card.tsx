import { Mail, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <InfoBlock icon={<User className="size-4" />} label="Contact Name" value={<p className="text-sm font-medium text-gray-900">{client.contactName}</p>} />
          <InfoBlock
            icon={<Mail className="size-4" />}
            label="Email"
            value={
              <a href={`mailto:${client.contactEmail}`} className="text-sm font-medium text-blue-600 hover:underline">
                {client.contactEmail}
              </a>
            }
          />
          <InfoBlock
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

interface InfoBlockProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  className?: string
}

function InfoBlock({ icon, label, value, className }: InfoBlockProps) {
  return (
    <div className={`flex items-start gap-3 ${className ?? ''}`}>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        {value}
      </div>
    </div>
  )
}
