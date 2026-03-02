import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmployeesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Employees</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage employees and their cost rate history.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Download />
          Export CSV
        </Button>
        <Button>
          <Plus />
          New Employee
        </Button>
      </div>
    </div>
  )
}
