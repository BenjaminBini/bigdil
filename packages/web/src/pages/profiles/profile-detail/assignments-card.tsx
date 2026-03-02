import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
          <p className="text-sm text-muted-foreground">No active assignments</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Planned Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link to={`/employees/${assignment.employeeId}`} className="text-blue-600 hover:underline">
                      {assignment.employeeName}
                    </Link>
                  </TableCell>
                  <TableCell>{assignment.projectName}</TableCell>
                  <TableCell className="text-right">{formatDays(assignment.days)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
