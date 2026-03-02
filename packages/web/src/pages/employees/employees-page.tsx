import { useReferenceData } from '@/api/hooks'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { EmployeesHeader } from './components/employees-header'
import { EmployeeRow } from './components/employee-row'

const assignedProjects: Record<string, number> = {
  e1: 1,
  e2: 1,
  e3: 1,
  e4: 1,
  e5: 0,
}

export default function EmployeesPage() {
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !refData) return <div className="p-6">Error loading data</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <EmployeesHeader />

      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-8 pr-0" />
              <TableHead>Name</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Current Cost Rate/Day</TableHead>
              <TableHead className="text-right">Assigned Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refData.employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                projectCount={assignedProjects[employee.id] ?? 0}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
