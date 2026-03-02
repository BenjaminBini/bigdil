import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldRow, SectionCard, Toggle } from '@/components/shared/section-card'

interface UnassignedBehaviorSectionProps {
  enabled: boolean
  onChange: (next: boolean) => void
}

export function UnassignedBehaviorSection({ enabled, onChange }: UnassignedBehaviorSectionProps) {
  return (
    <SectionCard
      title="UNASSIGNED Behavior"
      description="How to handle rows where no employee has been assigned"
    >
      <div className="flex items-start gap-4">
        <Toggle id="unassigned-behavior" checked={enabled} onChange={onChange} />
        <div className="space-y-1">
          <Label htmlFor="unassigned-behavior" className="cursor-pointer text-sm font-medium text-gray-700">
            Use profile default cost rate for UNASSIGNED rows
          </Label>
          <p className="text-sm text-gray-500">
            When UNASSIGNED rows exist, use the profile's default cost rate for forecast calculations
            instead of leaving costs as zero.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

interface ApplicationSectionProps {
  appName: string
  companyName: string
  onAppNameChange: (next: string) => void
  onCompanyNameChange: (next: string) => void
}

export function ApplicationSection({
  appName,
  companyName,
  onAppNameChange,
  onCompanyNameChange,
}: ApplicationSectionProps) {
  return (
    <SectionCard title="Application" description="General application identity settings">
      <FieldRow label="Application name" htmlFor="app-name">
        <Input id="app-name" value={appName} onChange={(event) => onAppNameChange(event.target.value)} />
      </FieldRow>

      <Separator />

      <FieldRow label="Company name" htmlFor="company-name">
        <Input id="company-name" value={companyName} onChange={(event) => onCompanyNameChange(event.target.value)} />
      </FieldRow>
    </SectionCard>
  )
}
