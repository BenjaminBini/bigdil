import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { useEmployee } from '@/api/hooks'
import { formatCurrency, formatDate, formatDays } from '@/lib/format'
import { timesheetStatusColors } from '@/lib/constants'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useEmployee(id!)

  if (isLoading) return <div className="p-6">Loading employee...</div>
  if (error || !data) return <div className="p-6">Error loading employee</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/employees">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Employee ID: ${data.id}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={data.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
                {data.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Cost Rate</span>
              <span className="font-medium">{formatCurrency(data.currentCostRatePerDay)}/day</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost Rate History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cost Rate History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid To</TableHead>
                  <TableHead className="text-right">Cost Rate / Day</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.costRateHistory.map((cr, i) => (
                  <TableRow key={i}>
                    <TableCell>{formatDate(cr.validFrom)}</TableCell>
                    <TableCell>{cr.validTo ? formatDate(cr.validTo) : 'Current'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(cr.costRatePerDay)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {data.assignments.length === 0 ? (
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
                {data.assignments.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link to={`/projects/${a.projectId}`} className="text-blue-600 hover:underline">
                        {a.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>{a.taskName}</TableCell>
                    <TableCell>{a.profileName}</TableCell>
                    <TableCell>P{a.periodNumber}</TableCell>
                    <TableCell className="text-right">{formatDays(a.days)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Timesheets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          {data.timesheets.length === 0 ? (
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
                {data.timesheets.slice(0, 20).map(ts => (
                  <TableRow key={ts.id}>
                    <TableCell>{formatDate(ts.workDate)}</TableCell>
                    <TableCell>
                      <Link to={`/projects/${ts.projectId}`} className="text-blue-600 hover:underline">
                        {ts.projectId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={timesheetStatusColors[ts.status]}>{ts.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatDays(Number(ts.days))}</TableCell>
                    <TableCell className="text-right">
                      {ts.appliedCostAmount ? formatCurrency(Number(ts.appliedCostAmount)) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
