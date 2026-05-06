import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexRow } from '@/components/shared/layouts'
import { useEmployee } from '@/api/hooks'
import { AssignmentsCard } from './employee-detail/assignments-card'
import { EmployeeInfoCards } from './employee-detail/employee-info-cards'
import { RecentTimesheetsCard } from './employee-detail/recent-timesheets-card'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useEmployee(id!)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading employee" />

  return (
    <PageContainer size="full">
      <FlexRow>
        <Link to="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Employee ID: ${data.id}`} />
      </FlexRow>

      <EmployeeInfoCards employee={data} />
      <AssignmentsCard assignments={data.assignments} />
      <RecentTimesheetsCard timesheets={data.timesheets} />
    </PageContainer>
  )
}
