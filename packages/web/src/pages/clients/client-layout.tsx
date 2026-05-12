import { useState } from "react";
import { Outlet, useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjects, useReferenceData } from "@/api/hooks";
import {
  LoadingState,
  ErrorState,
  PageContainer,
} from "@/components/shared/page-container";
import { DetailPageBackground } from "@/components/shared/detail-layout";
import { ClientHeader } from "./components/client-header";
import { EditClientDialog } from "./components/edit-client-dialog";

export default function ClientLayout() {
  const { t } = useTranslation("pages");
  const { id } = useParams<{ id: string }>();
  const [showEdit, setShowEdit] = useState(false);

  const {
    data: refData,
    isLoading: refLoading,
    error: refError,
  } = useReferenceData();
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  if (refLoading || projectsLoading) return <LoadingState />;
  if (refError || projectsError || !refData || !projects) return <ErrorState />;

  const client = refData.clients.find((entry) => entry.id === id);
  if (!client) return <ErrorState message={t("clients.notFound")} />;

  const projectCount = projects.filter((p) => p.clientId === id).length;

  return (
    <DetailPageBackground>
      <div className="px-6 pt-4">
        <Link
          to="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          {t("clients.backToAll")}
        </Link>
      </div>
      <ClientHeader
        clientId={id!}
        name={client.name}
        projectCount={projectCount}
        onEdit={() => setShowEdit(true)}
      />
      <PageContainer>
        <Outlet />
      </PageContainer>

      <EditClientDialog
        client={client}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </DetailPageBackground>
  );
}
