import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TdRight, ThRight } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { MutedText } from '@/components/shared/muted-text'
import { formatDays } from '@/lib/format'
import type { EmployeeDetail } from '@/api/types'

interface AssignmentsCardProps {
  assignments: EmployeeDetail['assignments']
}

export function AssignmentsCard({ assignments }: AssignmentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <MutedText>No current assignments</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Period</TableHead>
                <ThRight>Days</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <AppLink to={`/projects/${assignment.projectId}`}>
                      {assignment.projectName}
                    </AppLink>
                  </TableCell>
                  <TableCell>{assignment.taskName}</TableCell>
                  <TableCell>{assignment.profileName}</TableCell>
                  <TableCell>{assignment.periodCode}</TableCell>
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
