import { useState } from 'react'
import { useReferenceData } from '@/api/hooks'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { ThRight } from '@/components/shared/table-cells'
import { EmployeesHeader } from './components/employees-header'
import { EmployeeRow } from './components/employee-row'
import { NewEmployeeDialog } from './components/new-employee-dialog'

export default function EmployeesPage() {
  const [showNewEmployee, setShowNewEmployee] = useState(false)
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <LoadingState />
  if (error || !refData) return <ErrorState />

  return (
    <PageContainer size="md">
      <EmployeesHeader onNew={() => setShowNewEmployee(true)} />

      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead className="w-8 pr-0" />
              <TableHead>Name</TableHead>
              <TableHead>Active</TableHead>
              <ThRight>Current Cost Rate/Day</ThRight>
              <ThRight>Assigned Projects</ThRight>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refData.employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                projectCount={employee.assignedProjectCount}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
      <NewEmployeeDialog open={showNewEmployee} onClose={() => setShowNewEmployee(false)} />
    </PageContainer>
  )
}
