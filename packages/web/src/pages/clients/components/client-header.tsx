import { Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlexRow } from "@/components/shared/layouts";
import { VStack } from "@/components/shared/VStack";
import { IconBox } from "@/components/shared/icon-box";
import { PageTitle } from "@/components/shared/page-title";
import { MutedText } from "@/components/shared/muted-text";
import {
  DetailHeaderShell,
  TitleActionsRow,
  TabNav,
  TabLink,
} from "@/components/shared/detail-layout";

const tabs = [
  { label: "Overview", path: "overview" },
  { label: "Projects", path: "projects" },
];

interface ClientHeaderProps {
  clientId: string;
  name: string;
  projectCount: number;
  onEdit: () => void;
}

export function ClientHeader({
  clientId,
  name,
  projectCount,
  onEdit,
}: ClientHeaderProps) {
  return (
    <DetailHeaderShell>
      <TitleActionsRow>
        <FlexRow>
          <IconBox icon={Building2} size="md" variant="muted" />
          <VStack gap="xs">
            <PageTitle>{name}</PageTitle>
            <MutedText spacing="tight">
              {projectCount} project{projectCount !== 1 ? "s" : ""}
            </MutedText>
          </VStack>
        </FlexRow>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
      </TitleActionsRow>

      <TabNav>
        {tabs.map((tab) => (
          <TabLink
            key={tab.path}
            to={`/clients/${clientId}/${tab.path}`}
          >
            {tab.label}
          </TabLink>
        ))}
      </TabNav>
    </DetailHeaderShell>
  );
}
