import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@/components/shared/status-badge'
import { deriveProjectLifecycle } from '@/lib/constants'
import { FlexRow } from '@/components/shared/layouts'
import { VStack } from '@/components/shared/VStack'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { NullCell } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { DetailHeaderShell, TitleActionsRow, TabNav, TabLink } from '@/components/shared/detail-layout'
import type { ProjectKpiCardProps } from './project-kpi-card'
import { ProjectActions } from './project-actions'

interface ProjectHeaderProps {
  projectId: string
  name: string
  clientId: string
  clientName: string | null
  kpis: ProjectKpiCardProps[]
  startDate?: string | null
  endDate?: string | null
  closedAt?: string | null
  isActive: boolean
}

function ProjectActionsRow({ children }: { children: ReactNode }) {
  return <div className="order-2 flex flex-wrap items-center gap-2 lg:order-3 lg:ml-auto">{children}</div>
}

function CompactKpiStrip({ kpis }: { kpis: ProjectKpiCardProps[] }) {
  return (
    <div className="order-3 w-full overflow-x-auto rounded-md border bg-muted/40 px-3 py-2 lg:order-2 lg:w-auto lg:flex-1 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
      <div className="flex min-w-max items-start gap-5 lg:min-w-0 lg:flex-wrap">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex min-w-[90px] flex-col gap-0.5 whitespace-nowrap">
            <span className="text-[10px] font-medium uppercase leading-none text-muted-foreground">{kpi.label}</span>
            <span className="text-sm font-semibold leading-tight tabular-nums text-foreground">{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectHeader({ projectId, name, clientId, clientName, kpis, startDate, endDate, closedAt, isActive }: ProjectHeaderProps) {
  const lifecycle = deriveProjectLifecycle({ startDate: startDate ?? null, endDate: endDate ?? null, closedAt: closedAt ?? null, isActive })
  const { t } = useTranslation('pages')
  const tabs = [
    { label: t('projectLayout.tabs.overview'), path: 'overview' },
    { label: t('projectLayout.tabs.quotes'), path: 'quotes' },
    { label: t('projectLayout.tabs.workTable'), path: 'work-table' },
    { label: t('projectLayout.tabs.timesheets'), path: 'timesheets' },
    { label: t('projectLayout.tabs.snapshots'), path: 'snapshots' },
  ]

  return (
    <DetailHeaderShell>
      <TitleActionsRow>
        <VStack gap="xs" className="order-1">
          <FlexRow>
            <PageTitle>{name}</PageTitle>
          </FlexRow>
          <MutedText>
            {t('projectLayout.client')} :{' '}
            {clientName ? (
              <AppLink to={`/clients/${clientId}`} bold onClick={(event) => event.stopPropagation()}>
                {clientName}
              </AppLink>
            ) : (
              <NullCell />
            )}
          </MutedText>
        </VStack>

        <CompactKpiStrip kpis={kpis} />

        <ProjectActionsRow>
          <StatusBadge status={lifecycle} />
          <ProjectActions projectId={projectId} isClosed={!!closedAt} hasDates={!!(startDate && endDate)} />
        </ProjectActionsRow>
      </TitleActionsRow>

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
