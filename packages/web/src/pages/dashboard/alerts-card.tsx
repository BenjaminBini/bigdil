import { Link } from 'react-router'
import type { ReactNode } from 'react'
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
  const hasNoAlerts = alerts.periodsNeedingClosure.length === 0 && alerts.overdueApprovals === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.periodsNeedingClosure.length > 0 && (
          <div>
            <SectionHeading><TextStrong>Périodes en consolidation (prêtes à clôturer)</TextStrong></SectionHeading>
            {alerts.periodsNeedingClosure.map((period) => (
              <CardLink key={period.periodId} to={`/projects/${period.projectId}/snapshots`}>
                <span>
                  {period.projectName} - Période {period.periodNumber}
                </span>
                <StatusBadge status="CONSOLIDATION" />
              </CardLink>
            ))}
          </div>
        )}

        {alerts.overdueApprovals > 0 && (
          <div>
            <SectionHeading><TextStrong>Approbations en attente</TextStrong></SectionHeading>
            <CardLink to="/timesheets/approvals">
              <span>{alerts.overdueApprovals} feuille{alerts.overdueApprovals > 1 ? 's' : ''} de temps en attente d'approbation</span>
              <Badge variant="outline">
                Réviser
              </Badge>
            </CardLink>
          </div>
        )}

        {hasNoAlerts && <MutedText>Aucune alerte — tout est en ordre.</MutedText>}
      </CardContent>
    </Card>
  )
}
