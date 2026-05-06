import { useParams } from "react-router";
import { useReferenceData } from "@/api/hooks";
import { LoadingState, ErrorState } from "@/components/shared/page-container";
import { ClientOverviewCard } from "./components/client-overview-card";

export default function ClientOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: refData, isLoading, error } = useReferenceData();

  if (isLoading) return <LoadingState />;
  if (error || !refData) return <ErrorState />;

  const client = refData.clients.find((entry) => entry.id === id);
  if (!client) return <ErrorState message="Client not found" />;

  return <ClientOverviewCard client={client} />;
}
