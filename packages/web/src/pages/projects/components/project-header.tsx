import type { ReactNode } from 'react'
import { projectStatusLabels } from '@/lib/constants'
import { StatusBadge } from '@/components/shared/status-badge'
import { FlexRow } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { NullCell } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { DetailHeaderShell, TitleActionsRow, TabNav, TabLink } from '@/components/shared/detail-layout'
import { ProjectKpiCard, type ProjectKpiCardProps } from './project-kpi-card'
import { ProjectActions } from './project-actions'

const tabs = [
  { label: 'Vue générale', path: 'overview' },
  { label: 'Devis', path: 'quotes' },
  { label: 'Tableau de planification', path: 'work-table' },
  { label: 'Feuilles de temps', path: 'timesheets' },
  { label: 'Snapshots', path: 'snapshots' },
]

interface ProjectHeaderProps {
  projectId: string
  name: string
  status: keyof typeof projectStatusLabels
  clientId: string
  clientName: string | null
  kpis: ProjectKpiCardProps[]
  startDate?: string | null
  endDate?: string | null
}

function ProjectActionsRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

function KpiScrollRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-6 flex divide-x divide-border overflow-x-auto border-t">
      {children}
    </div>
  )
}

export function ProjectHeader({ projectId, name, status, clientId, clientName, kpis, startDate, endDate }: ProjectHeaderProps) {
  return (
    <DetailHeaderShell>
      <TitleActionsRow>
        <VStack gap="xs">
          <FlexRow>
            <PageTitle>{name}</PageTitle>
            <StatusBadge status={status} />
          </FlexRow>
          <MutedText>
            Client :{' '}
            {clientName ? (
              <AppLink to={`/clients/${clientId}`} bold onClick={(event) => event.stopPropagation()}>
                {clientName}
              </AppLink>
            ) : (
              <NullCell />
            )}
          </MutedText>
        </VStack>

        <ProjectActionsRow>
          <ProjectActions projectId={projectId} status={status} startDate={startDate} endDate={endDate} />
        </ProjectActionsRow>
      </TitleActionsRow>

      <KpiScrollRow>
        {kpis.map((kpi) => (
          <ProjectKpiCard key={kpi.label} {...kpi} />
        ))}
      </KpiScrollRow>

      <TabNav>
        {tabs.map((tab) => (
          <TabLink key={tab.path} to={`/projects/${projectId}/${tab.path}`}>
            {tab.label}
          </TabLink>
        ))}
      </TabNav>
    </DetailHeaderShell>
  )
}
