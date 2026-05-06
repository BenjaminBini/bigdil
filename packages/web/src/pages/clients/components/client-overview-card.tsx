import type { ReactNode } from 'react'
import { Mail, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBlock } from '@/components/shared/icon-block'
import { TextStrong } from '@/components/shared/text-strong'
import type { Client } from '@/api/types'

function ContactGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

function ContactGridFullRow({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}

function MailLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-sm text-blue-600 hover:underline font-medium">
      {children}
    </a>
  )
}

interface ClientOverviewCardProps {
  client: Client
}

export function ClientOverviewCard({ client }: ClientOverviewCardProps) {
  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <ContactGrid>
          <IconBlock icon={<User size={16} />} label="Contact Name" value={<TextStrong>{client.contactName}</TextStrong>} />
          <IconBlock
            icon={<Mail size={16} />}
            label="Email"
            value={<MailLink href={`mailto:${client.contactEmail}`}>{client.contactEmail}</MailLink>}
          />
          <ContactGridFullRow>
            <IconBlock
              icon={<MapPin size={16} />}
              label="Address"
              value={<TextStrong>{client.address}</TextStrong>}
            />
          </ContactGridFullRow>
        </ContactGrid>
      </CardContent>
    </Card>
  )
}
