import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

export function EmployeesHeader() {
  return (
    <PageHeader
      title="Employees"
      subtitle="Manage employees and their cost rate history."
      actions={
        <>
          <Button variant="outline">
            <Download />
            Export CSV
          </Button>
          <Button>
            <Plus />
            New Employee
          </Button>
        </>
      }
    />
  )
}
