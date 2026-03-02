import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/shared/color-value'
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
                          <ColorValue
                            value={period.utilization}
                            format="percent"
                            sentiment={period.utilization >= 80 ? 'positive' : period.utilization >= 50 ? 'warning' : 'negative'}
                          />
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

