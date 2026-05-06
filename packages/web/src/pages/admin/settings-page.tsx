import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { FlexBetween, FlexEnd } from "@/components/shared/layouts";
import { PageTitle } from "@/components/shared/page-title";
import { MutedText } from "@/components/shared/muted-text";
import {
  ApplicationSection,
  UnassignedBehaviorSection,
} from "./settings/sections-app";
import {
  CurrencySection,
  WeekSettingsSection,
} from "./settings/sections-general";

export default function SettingsPage() {
  const [weekStart, setWeekStart] = useState("monday");
  const [dayPrecision, setDayPrecision] = useState("0.25");
  const [currency, setCurrency] = useState("EUR");
  const [unassignedBehavior, setUnassignedBehavior] = useState(true);
  const [appName, setAppName] = useState("BigDil PSA");
  const [companyName, setCompanyName] = useState("Acme Consulting");

  function handleSave() {
    toast.success("Settings saved");
  }

  return (
    <PageContainer size="sm">
      <FlexBetween>
        <div>
          <PageTitle>Settings</PageTitle>
          <MutedText spacing="tight">
            Configure global application preferences
          </MutedText>
        </div>
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </FlexBetween>
      <WeekSettingsSection
        weekStart={weekStart}
        dayPrecision={dayPrecision}
        onWeekStartChange={setWeekStart}
        onDayPrecisionChange={setDayPrecision}
      />
      <CurrencySection currency={currency} onCurrencyChange={setCurrency} />
      <UnassignedBehaviorSection
        enabled={unassignedBehavior}
        onChange={setUnassignedBehavior}
      />
      <ApplicationSection
        appName={appName}
        companyName={companyName}
        onAppNameChange={setAppName}
        onCompanyNameChange={setCompanyName}
      />
      <FlexEnd>
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </FlexEnd>
    </PageContainer>
  );
}
