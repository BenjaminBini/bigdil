import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { MutedText } from '@/components/shared/muted-text'
import { TextStrong } from '@/components/shared/text-strong'
import type { DashboardData } from '@/api/types'

function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded border p-2 text-sm transition-colors hover:bg-accent"
    >
      {children}
    </Link>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm">{children}</p>
}

interface AlertsCardProps {
  alerts: DashboardData['alerts']
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const { t } = useTranslation('pages')
  const hasNoAlerts = alerts.periodsNeedingClosure.length === 0 && alerts.overdueApprovals === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.alerts.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.periodsNeedingClosure.length > 0 && (
          <div>
            <SectionHeading><TextStrong>{t('dashboard.alerts.periodsReady')}</TextStrong></SectionHeading>
            {alerts.periodsNeedingClosure.map((period) => (
              <CardLink key={period.periodId} to={`/projects/${period.projectId}/snapshots`}>
                <span>
                  {period.projectName} - {t('dashboard.alerts.periodLabel')} {period.periodNumber}
                </span>
                <StatusBadge status="CONSOLIDATION" />
              </CardLink>
            ))}
          </div>
        )}

        {alerts.overdueApprovals > 0 && (
          <div>
            <SectionHeading><TextStrong>{t('dashboard.alerts.pendingApprovals')}</TextStrong></SectionHeading>
            <CardLink to="/approvals">
              <span>{t('dashboard.alerts.pendingApprovalsDescription', { count: alerts.overdueApprovals })}</span>
              <Badge variant="outline">
                {t('dashboard.alerts.review')}
              </Badge>
            </CardLink>
          </div>
        )}

        {hasNoAlerts && <MutedText>{t('dashboard.alerts.noAlerts')}</MutedText>}
      </CardContent>
    </Card>
  )
}
