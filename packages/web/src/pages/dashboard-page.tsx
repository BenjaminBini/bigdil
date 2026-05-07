import { useDashboard, useProjects } from "@/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import {
  LoadingState,
  ErrorState,
  PageContainer,
} from "@/components/shared/page-container";
import { ActiveProjectsCard } from "./dashboard/active-projects-card";
import { AlertsCard } from "./dashboard/alerts-card";
import { KpiStrip } from "./dashboard/kpi-strip";
import { RecentActivityCard } from "./dashboard/recent-activity-card";
import { GridCols2 } from "@/components/shared/layouts";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { data: projects } = useProjects();

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message="Erreur lors du chargement du tableau de bord" />;

  return (
    <PageContainer size="full">
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble multi-projets" />
      <KpiStrip kpis={data.kpis} />

      <GridCols2>
        <ActiveProjectsCard projects={data.activeProjectsList} />
        <AlertsCard alerts={data.alerts} />
      </GridCols2>

      <RecentActivityCard
        recentActivity={data.recentActivity}
        projects={projects}
      />
    </PageContainer>
  );
}
