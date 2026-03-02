import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { useEmployee } from '@/api/hooks'
import { AssignmentsCard } from './employee-detail/assignments-card'
import { EmployeeInfoCards } from './employee-detail/employee-info-cards'
import { RecentTimesheetsCard } from './employee-detail/recent-timesheets-card'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useEmployee(id!)

  if (isLoading) return <div className="p-6">Loading employee...</div>
  if (error || !data) return <div className="p-6">Error loading employee</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link to="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Employee ID: ${data.id}`} />
      </div>

      <EmployeeInfoCards employee={data} />
      <AssignmentsCard assignments={data.assignments} />
      <RecentTimesheetsCard timesheets={data.timesheets} />
    </div>
  )
}
