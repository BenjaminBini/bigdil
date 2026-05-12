import { Download, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

interface EmployeesHeaderProps {
  onNew: () => void
}

export function EmployeesHeader({ onNew }: EmployeesHeaderProps) {
  const { t } = useTranslation(['pages', 'common'])
  return (
    <PageHeader
      title={t('pages:employees.title')}
      subtitle={t('pages:employees.subtitle')}
      actions={
        <>
          <Button variant="outline" disabled title={t('pages:employees.exportUnavailable')}>
            <Download />
            {t('common:actions.export')} CSV
          </Button>
          <Button onClick={onNew}>
            <Plus />
            {t('pages:employees.newEmployee')}
          </Button>
        </>
      }
    />
  )
}
