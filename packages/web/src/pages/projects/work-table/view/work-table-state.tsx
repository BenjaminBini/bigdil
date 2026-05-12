import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState, ErrorState } from '@/components/shared/page-container'

export function WorkTableLoadingState() {
  return <LoadingState />
}

export function WorkTableProjectNotFound() {
  const { t } = useTranslation('pages')
  return <ErrorState message={t('workTable.states.projectNotFound')} variant="muted" />
}

interface WorkTableUnavailableStateProps {
  onSetDates?: () => void
}

// Surfaces when a project has no date range yet — the work table needs dates
// to render its period axis. Once dates are set the grid renders directly.
export function WorkTableUnavailableState({ onSetDates }: WorkTableUnavailableStateProps) {
  const { t } = useTranslation('pages')
  return (
    <EmptyState
      icon={Calendar}
      title={t('workTable.states.datesRequiredTitle')}
      description={t('workTable.states.datesRequiredDescription')}
      action={
        <Button onClick={onSetDates}>
          <Calendar size={16} />
          {t('workTable.states.setDates')}
        </Button>
      }
    />
  )
}

export function WorkTableDataUnavailableState() {
  const { t } = useTranslation('pages')
  return <ErrorState message={t('workTable.states.dataUnavailable')} variant="muted" />
}
