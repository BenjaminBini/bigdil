import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FlexBetween } from '@/components/shared/layouts'
import { Legend } from '@/components/shared/legend'
import { MutedText } from '@/components/shared/muted-text'
import { PageTitle } from '@/components/shared/page-title'

interface WorkTableHeaderProps {
  projectName: string
  periodCount: number
}

export function WorkTableHeader({ projectName, periodCount }: WorkTableHeaderProps) {
  const { t } = useTranslation('pages')
  return (
    <FlexBetween align="start" gap="md" wrap>
      <div>
        <PageTitle as="h2">{t('workTable.title')}</PageTitle>
        <MutedText spacing="tight">
          {t('workTable.subtitle', { projectName, count: periodCount })}
        </MutedText>
      </div>
      <Legend
        items={[
          { icon: <Lock size={8} color="#94a3b8" />, label: t('workTable.legend.frozen') },
          { swatch: 'bg-muted/60', swatchBorder: 'border-border', label: t('workTable.legend.consolidation') },
          { swatch: 'bg-primary/15', swatchBorder: 'border-primary/30', label: t('workTable.legend.open') },
          { swatch: 'bg-card', swatchBorder: 'border-border', label: t('workTable.legend.future') },
        ]}
      />
    </FlexBetween>
  )
}
