import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { timesheetStatusColors } from '@/lib/constants'
import { formatCurrency, formatDate, formatDays } from '@/lib/format'
import type { EmployeeDetail } from '@/api/types'

interface RecentTimesheetsCardProps {
  timesheets: EmployeeDetail['timesheets']
}

export function RecentTimesheetsCard({ timesheets }: RecentTimesheetsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Timesheets</CardTitle>
      </CardHeader>
      <CardContent>
        {timesheets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timesheets</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.slice(0, 20).map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>{formatDate(timesheet.workDate)}</TableCell>
                  <TableCell>
                    <Link to={`/projects/${timesheet.projectId}`} className="text-blue-600 hover:underline">
                      {timesheet.projectId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={timesheetStatusColors[timesheet.status]}>{timesheet.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatDays(Number(timesheet.days))}</TableCell>
                  <TableCell className="text-right">
                    {timesheet.appliedCostAmount ? formatCurrency(Number(timesheet.appliedCostAmount)) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
