import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

interface EmployeesHeaderProps {
  onNew: () => void
}

export function EmployeesHeader({ onNew }: EmployeesHeaderProps) {
  return (
    <PageHeader
      title="Collaborateurs"
      subtitle="Gérez vos collaborateurs et leur historique de taux de coût."
      actions={
        <>
          <Button variant="outline" disabled title="Export non disponible">
            <Download />
            Exporter CSV
          </Button>
          <Button onClick={onNew}>
            <Plus />
            Nouveau collaborateur
          </Button>
        </>
      }
    />
  )
}
