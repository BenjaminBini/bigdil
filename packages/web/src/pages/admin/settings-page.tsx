import { useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// ---- Toggle switch (no external dep) ----

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}

function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-blue-600' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ---- Section card ----

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-xs">
      <div className="px-6 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}

// ---- Field row ----

function FieldRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Label htmlFor={htmlFor} className="w-56 shrink-0 text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="flex-1 max-w-xs">{children}</div>
    </div>
  )
}

// ---- Page ----

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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure global application preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </div>

      {/* Week Settings */}
      <SectionCard
        title="Week Settings"
        description="Controls how periods and calendars are displayed"
      >
        <FieldRow label="Week starts on" htmlFor="week-start">
          <Select value={weekStart} onValueChange={setWeekStart}>
            <SelectTrigger id="week-start">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        <Separator />

        <FieldRow label="Day precision" htmlFor="day-precision">
          <Select value={dayPrecision} onValueChange={setDayPrecision}>
            <SelectTrigger id="day-precision">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.25">0.25 (quarter-day)</SelectItem>
              <SelectItem value="0.5">0.5 (half-day)</SelectItem>
              <SelectItem value="1.0">1.0 (full day)</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </SectionCard>

      {/* Currency */}
      <SectionCard
        title="Currency"
        description="Default currency for all financial calculations"
      >
        <FieldRow label="Default currency" htmlFor="currency">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="GBP">GBP — British Pound</SelectItem>
              <SelectItem value="CHF">CHF — Swiss Franc</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </SectionCard>

      {/* UNASSIGNED Behavior */}
      <SectionCard
        title="UNASSIGNED Behavior"
        description="How to handle rows where no employee has been assigned"
      >
        <div className="flex items-start gap-4">
          <Toggle
            id="unassigned-behavior"
            checked={unassignedBehavior}
            onChange={setUnassignedBehavior}
          />
          <div className="space-y-1">
            <Label htmlFor="unassigned-behavior" className="text-sm font-medium text-gray-700 cursor-pointer">
              Use profile default cost rate for UNASSIGNED rows
            </Label>
            <p className="text-sm text-gray-500">
              When UNASSIGNED rows exist, use the profile's default cost rate for forecast
              calculations instead of leaving costs as zero.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Application */}
      <SectionCard
        title="Application"
        description="General application identity settings"
      >
        <FieldRow label="Application name" htmlFor="app-name">
          <Input
            id="app-name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </FieldRow>

        <Separator />

        <FieldRow label="Company name" htmlFor="company-name">
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </FieldRow>
      </SectionCard>

      {/* Footer save */}
      <div className="flex justify-end pb-4">
        <Button onClick={handleSave}>
          <Save />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
