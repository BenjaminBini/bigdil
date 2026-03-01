import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { useProfile } from '@/api/hooks'
import { formatCurrency, formatDays } from '@/lib/format'
import { quoteStatusColors } from '@/lib/constants'

export default function ProfileDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useProfile(id!)

  if (isLoading) return <div className="p-6">Loading profile...</div>
  if (error || !data) return <div className="p-6">Error loading profile</div>

  const defaultMargin = data.defaultSellRatePerDay - data.defaultCostRatePerDay
  const defaultMarginPct = data.defaultSellRatePerDay > 0
    ? ((defaultMargin / data.defaultSellRatePerDay) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/profiles">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Profile ID: ${data.id}`} />
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default Sell Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.defaultSellRatePerDay)}/day</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default Cost Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.defaultCostRatePerDay)}/day</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(defaultMargin)}/day ({defaultMarginPct}%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Line Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Line Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {data.usage.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not used in any quotes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Sell Rate</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.usage.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link to={`/projects/${u.projectId}`} className="text-blue-600 hover:underline">
                        {u.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>{u.quoteTitle}</TableCell>
                    <TableCell>
                      <Badge className={quoteStatusColors[u.quoteStatus]}>{u.quoteStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatDays(u.days)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(u.sellRatePerDay)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(u.revenueAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {data.activeAssignments.length === 0 ? (
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
                {data.activeAssignments.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link to={`/employees/${a.employeeId}`} className="text-blue-600 hover:underline">
                        {a.employeeName}
                      </Link>
                    </TableCell>
                    <TableCell>{a.projectName}</TableCell>
                    <TableCell className="text-right">{formatDays(a.days)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rate Comparison */}
      {data.appliedRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applied Rates (from Approved Timesheets)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applied Cost Rate</TableHead>
                  <TableHead>Applied Sell Rate</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...new Set(data.appliedRates.map(r => `${r.costRate}-${r.sellRate}`))].map(key => {
                  const [costRate, sellRate] = key.split('-').map(Number)
                  return (
                    <TableRow key={key}>
                      <TableCell>{formatCurrency(costRate)}/day</TableCell>
                      <TableCell>{formatCurrency(sellRate)}/day</TableCell>
                      <TableCell>{formatCurrency(sellRate - costRate)}/day</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
