import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldRow, SectionCard } from '@/components/shared/section-card'

interface WeekSettingsSectionProps {
  weekStart: string
  dayPrecision: string
  onWeekStartChange: (next: string) => void
  onDayPrecisionChange: (next: string) => void
}

export function WeekSettingsSection({
  weekStart,
  dayPrecision,
  onWeekStartChange,
  onDayPrecisionChange,
}: WeekSettingsSectionProps) {
  return (
    <SectionCard title="Paramètres de semaine" description="Contrôle l'affichage des périodes et calendriers">
      <FieldRow label="La semaine commence le" htmlFor="week-start">
        <Select value={weekStart} onValueChange={onWeekStartChange}>
          <SelectTrigger id="week-start"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monday">Lundi</SelectItem>
            <SelectItem value="sunday">Dimanche</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <Separator />

      <FieldRow label="Précision jour" htmlFor="day-precision">
        <Select value={dayPrecision} onValueChange={onDayPrecisionChange}>
          <SelectTrigger id="day-precision"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.25">0.25 (quart de journée)</SelectItem>
            <SelectItem value="0.5">0.5 (demi-journée)</SelectItem>
            <SelectItem value="1.0">1.0 (journée entière)</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>
    </SectionCard>
  )
}

interface CurrencySectionProps {
  currency: string
  onCurrencyChange: (next: string) => void
}

export function CurrencySection({ currency, onCurrencyChange }: CurrencySectionProps) {
  return (
    <SectionCard title="Devise" description="Devise par défaut pour tous les calculs financiers">
      <FieldRow label="Devise par défaut" htmlFor="currency">
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
            <SelectItem value="USD">USD - US Dollar</SelectItem>
            <SelectItem value="GBP">GBP - British Pound</SelectItem>
            <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>
    </SectionCard>
  )
}
