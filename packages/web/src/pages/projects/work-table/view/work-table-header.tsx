import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Legend } from '@/components/shared/legend'

function WorkTableHeaderBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-3">
      <div>{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  )
}

interface WorkTableHeaderProps {
  projectName: string
  periodCount: number
}

export function WorkTableHeader({ projectName, periodCount }: WorkTableHeaderProps) {
  return (
    <WorkTableHeaderBar
      left={
        <>
          <h1 className="text-base font-semibold text-foreground">Work Table</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {projectName} - {periodCount} periods
          </p>
        </>
      }
      right={
        <Legend items={[
          { icon: <Lock size={8} color="#94a3b8" />, label: 'Frozen' },
          { swatch: 'bg-amber-100', swatchBorder: 'border-amber-200', label: 'Consolidation' },
          { swatch: 'bg-sky-100', swatchBorder: 'border-sky-200', label: 'Open' },
          { swatch: 'bg-card', swatchBorder: 'border-border', label: 'Future' },
        ]} />
      }
    />
  )
}
