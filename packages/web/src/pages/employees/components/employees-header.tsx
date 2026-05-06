import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

interface EmployeesHeaderProps {
  onNew: () => void
}

export function EmployeesHeader({ onNew }: EmployeesHeaderProps) {
  return (
    <PageHeader
      title="Employees"
      subtitle="Manage employees and their cost rate history."
      actions={
        <>
          <Button variant="outline" disabled title="Export not yet implemented">
            <Download />
            Export CSV
          </Button>
          <Button onClick={onNew}>
            <Plus />
            New Employee
          </Button>
        </>
      }
    />
  )
}
