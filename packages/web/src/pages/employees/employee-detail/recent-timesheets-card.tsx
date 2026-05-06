import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TdRight, ThRight } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { StatusBadge } from '@/components/shared/status-badge'
import { MutedText } from '@/components/shared/muted-text'
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
          <MutedText>No timesheets</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <ThRight>Days</ThRight>
                <ThRight>Cost</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.slice(0, 20).map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>{formatDate(timesheet.workDate)}</TableCell>
                  <TableCell>
                    <AppLink to={`/projects/${timesheet.projectId}`}>
                      {timesheet.projectId}
                    </AppLink>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={timesheet.status} />
                  </TableCell>
                  <TdRight>{formatDays(Number(timesheet.days))}</TdRight>
                  <TdRight>
                    {timesheet.appliedCostAmount ? formatCurrency(Number(timesheet.appliedCostAmount)) : '—'}
                  </TdRight>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
