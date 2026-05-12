import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  return (
    <WorkTableHeaderBar
      left={
        <>
          <h1 className="text-base font-semibold text-foreground">{t('workTable.title')}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('workTable.subtitle', { projectName, count: periodCount })}
          </p>
        </>
      }
      right={
        <Legend items={[
          { icon: <Lock size={8} color="#94a3b8" />, label: t('workTable.legend.frozen') },
          { swatch: 'bg-muted/60', swatchBorder: 'border-border', label: t('workTable.legend.consolidation') },
          { swatch: 'bg-primary/15', swatchBorder: 'border-primary/30', label: t('workTable.legend.open') },
          { swatch: 'bg-card', swatchBorder: 'border-border', label: t('workTable.legend.future') },
        ]} />
      }
    />
  )
}
