import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TdRight, ThRight } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { MutedText } from '@/components/shared/muted-text'
import { formatDays } from '@/lib/format'
import type { ProfileDetail } from '@/api/types'

interface ProfileAssignmentsCardProps {
  assignments: ProfileDetail['activeAssignments']
}

export function ProfileAssignmentsCard({ assignments }: ProfileAssignmentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <MutedText>No active assignments</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <ThRight>Planned Days</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <AppLink to={`/employees/${assignment.employeeId}`}>
                      {assignment.employeeName}
                    </AppLink>
                  </TableCell>
                  <TableCell>{assignment.projectName}</TableCell>
                  <TdRight>{formatDays(assignment.days)}</TdRight>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
