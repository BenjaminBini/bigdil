import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUtilizationReport } from '@/api/hooks'

export function UtilizationTab() {
  const { data, isLoading, error } = useUtilizationReport()

  if (isLoading) return <div className="py-4">Loading utilization data...</div>
  if (error || !data) return <div className="py-4">Error loading utilization data</div>

  const allPeriods = [...new Set(data.flatMap((entry) => entry.periods.map((p) => p.periodNumber)))].sort(
    (a, b) => a - b,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Utilization by Period</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No utilization data available yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Employee</TableHead>
                  {allPeriods.map((period) => (
                    <TableHead key={period} className="min-w-[60px] text-center">P{period}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      <Link to={`/employees/${employee.employeeId}`} className="text-blue-600 hover:underline">
                        {employee.employeeName}
                      </Link>
                    </TableCell>
                    {allPeriods.map((periodNumber) => {
                      const period = employee.periods.find((p) => p.periodNumber === periodNumber)
                      if (!period) return <TableCell key={periodNumber} className="text-center text-muted-foreground">—</TableCell>
                      return (
                        <TableCell key={periodNumber} className="text-center">
                          <Badge className={`${utilizationBadgeClass(period.utilization)} text-xs`}>
                            {period.utilization.toFixed(0)}%
                          </Badge>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function utilizationBadgeClass(utilization: number): string {
  if (utilization >= 80) return 'bg-green-100 text-green-800'
  if (utilization >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}
