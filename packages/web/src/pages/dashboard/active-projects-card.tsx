import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { MutedText } from '@/components/shared/muted-text'
import { TextStrong } from '@/components/shared/text-strong'
import { VStack } from '@/components/shared/VStack'
import type { DashboardData } from '@/api/types'

function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b p-3 transition-colors hover:bg-accent last:border-b-0"
    >
      {children}
    </Link>
  )
}

interface ActiveProjectsCardProps {
  projects: DashboardData['activeProjectsList']
}

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  const { t } = useTranslation('pages')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.activeProjectsTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack>
          {projects.map((project) => (
            <CardLink key={project.id} to={`/projects/${project.id}`}>
              <div>
                <TextStrong>{project.name}</TextStrong>
                <MutedText>{project.clientName}</MutedText>
              </div>
              <StatusBadge status="ACTIVE" />
            </CardLink>
          ))}
          {projects.length === 0 && <MutedText>{t('dashboard.noActiveProjects')}</MutedText>}
        </VStack>
      </CardContent>
    </Card>
  )
}
