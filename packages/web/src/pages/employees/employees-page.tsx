import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useReferenceData } from '@/api/hooks'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { ThRight } from '@/components/shared/table-cells'
import { EmployeesHeader } from './components/employees-header'
import { EmployeeRow } from './components/employee-row'
import { NewEmployeeDialog } from './components/new-employee-dialog'

export default function EmployeesPage() {
  const { t } = useTranslation('pages')
  const [showNewEmployee, setShowNewEmployee] = useState(false)
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <LoadingState />
  if (error || !refData) return <ErrorState />

  return (
    <>
      <EmployeesHeader onNew={() => setShowNewEmployee(true)} />
      <PageContainer size="md">
        {refData.employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('employees.empty')}
            description={t('employees.emptyDescription')}
            action={
              <Button onClick={() => setShowNewEmployee(true)}>
                <Plus />
                {t('employees.createFirst')}
              </Button>
            }
          />
        ) : (
          <Card variant="flush">
            <Table>
              <TableHeader>
                <TableRow variant="header">
                  <TableHead className="w-8 pr-0" />
                  <TableHead>{t('employees.table.name')}</TableHead>
                  <TableHead>{t('employees.table.active')}</TableHead>
                  <ThRight>{t('employees.table.costRate')}</ThRight>
                  <ThRight>{t('employees.table.assignedProjects')}</ThRight>
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
        )}
        <NewEmployeeDialog open={showNewEmployee} onClose={() => setShowNewEmployee(false)} />
      </PageContainer>
    </>
  )
}
