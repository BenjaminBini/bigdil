import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
          <p className="text-sm text-muted-foreground">No current assignments</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link to={`/projects/${assignment.projectId}`} className="text-blue-600 hover:underline">
                      {assignment.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{assignment.taskName}</TableCell>
                  <TableCell>{assignment.profileName}</TableCell>
                  <TableCell>P{assignment.periodNumber}</TableCell>
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
