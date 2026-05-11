import { useState } from "react";
import { useParams } from "react-router";
import { useProjects } from "@/api/hooks";
import { LoadingState, ErrorState } from "@/components/shared/page-container";
import { ClientProjectsTable } from "./components/client-projects-table";
import type {
  ClientProjectSortKey as SortKey,
  SortDir,
} from "./components/client-project-table-utils";
import type { ProjectListItem } from "@/api/types";

interface ProjectRow {
  project: ProjectListItem;
  contractValue: number;
  marginForecast: number | null;
}

export default function ClientProjectsPage() {
  const { id } = useParams<{ id: string }>();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <LoadingState />;
  if (error || !projects) return <ErrorState />;

  const projectRows: ProjectRow[] = projects
    .filter((project) => project.clientId === id)
    .map((project) => ({
      project,
      contractValue: project.contractValue,
      marginForecast: null,
    }));

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDir("asc");
  }

  const sortedProjects = [...projectRows].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = a.project.name.localeCompare(b.project.name);
        break;
      case "status": {
        // Closed projects sort last; otherwise by startDate.
        const aClosed = a.project.closedAt ? 1 : 0;
        const bClosed = b.project.closedAt ? 1 : 0;
        cmp = aClosed - bClosed;
        if (cmp === 0) cmp = (a.project.startDate ?? '').localeCompare(b.project.startDate ?? '');
        break;
      }
      case "contractValue":
        cmp = a.contractValue - b.contractValue;
        break;
      case "marginForecast":
        cmp = (a.marginForecast ?? 0) - (b.marginForecast ?? 0);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <ClientProjectsTable
      rows={sortedProjects}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
    />
  );
}
