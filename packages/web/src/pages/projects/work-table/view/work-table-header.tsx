import { Lock } from 'lucide-react'
import { Legend } from '@/components/shared/legend'

interface WorkTableHeaderProps {
  projectName: string
  periodCount: number
}

export function WorkTableHeader({ projectName, periodCount }: WorkTableHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Work Table</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {projectName} - {periodCount} periods
        </p>
      </div>

      <Legend items={[
        { icon: <Lock className="size-2 text-slate-400" />, label: 'Frozen' },
        { swatch: 'bg-amber-100', swatchBorder: 'border-amber-200', label: 'Consolidation' },
        { swatch: 'bg-sky-100', swatchBorder: 'border-sky-200', label: 'Open' },
        { swatch: 'bg-white', swatchBorder: 'border-slate-200', label: 'Future' },
      ]} />
    </div>
  )
}
