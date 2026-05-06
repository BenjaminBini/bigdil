import { useId, type ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  children?: ReactNode
}

export function Toggle({ checked, onChange, label, children }: ToggleProps) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked ? 'true' : 'false'}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
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
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-700">
          {label}
        </Label>
        {children && <p className="text-xs text-gray-500">{children}</p>}
      </div>
    </div>
  )
}

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-xs">
      <div className="border-b px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </div>
  )
}

interface FieldRowProps {
  label: string
  htmlFor?: string
  children: ReactNode
}

export function FieldRow({ label, htmlFor, children }: FieldRowProps) {
  return (
    <div className="flex items-center gap-4">
      <Label htmlFor={htmlFor} className="w-56 shrink-0 text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="max-w-xs flex-1">{children}</div>
    </div>
  )
}
