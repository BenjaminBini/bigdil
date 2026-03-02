import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ApplicationSection, UnassignedBehaviorSection } from './settings/sections-app'
import { CurrencySection, WeekSettingsSection } from './settings/sections-general'

export default function SettingsPage() {
  const [weekStart, setWeekStart] = useState('monday')
  const [dayPrecision, setDayPrecision] = useState('0.25')
  const [currency, setCurrency] = useState('EUR')
  const [unassignedBehavior, setUnassignedBehavior] = useState(true)
  const [appName, setAppName] = useState('BigDil PSA')
  const [companyName, setCompanyName] = useState('Acme Consulting')

  function handleSave() {
    toast.success('Settings saved')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Configure global application preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </div>

      <WeekSettingsSection
        weekStart={weekStart}
        dayPrecision={dayPrecision}
        onWeekStartChange={setWeekStart}
        onDayPrecisionChange={setDayPrecision}
      />
      <CurrencySection currency={currency} onCurrencyChange={setCurrency} />
      <UnassignedBehaviorSection enabled={unassignedBehavior} onChange={setUnassignedBehavior} />
      <ApplicationSection
        appName={appName}
        companyName={companyName}
        onAppNameChange={setAppName}
        onCompanyNameChange={setCompanyName}
      />

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
