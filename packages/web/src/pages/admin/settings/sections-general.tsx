import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  return (
    <SectionCard title={t('settings.general.weekSettingsTitle')} description={t('settings.general.weekSettingsDescription')}>
      <FieldRow label={t('settings.general.weekStartLabel')} htmlFor="week-start">
        <Select value={weekStart} onValueChange={onWeekStartChange}>
          <SelectTrigger id="week-start"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monday">{t('settings.general.monday')}</SelectItem>
            <SelectItem value="sunday">{t('settings.general.sunday')}</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <Separator />

      <FieldRow label={t('settings.general.dayPrecisionLabel')} htmlFor="day-precision">
        <Select value={dayPrecision} onValueChange={onDayPrecisionChange}>
          <SelectTrigger id="day-precision"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.25">{t('settings.general.precisionQuarter')}</SelectItem>
            <SelectItem value="0.5">{t('settings.general.precisionHalf')}</SelectItem>
            <SelectItem value="1.0">{t('settings.general.precisionFull')}</SelectItem>
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
  const { t } = useTranslation('pages')
  return (
    <SectionCard title={t('settings.general.currencyTitle')} description={t('settings.general.currencyDescription')}>
      <FieldRow label={t('settings.general.currencyLabel')} htmlFor="currency">
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
