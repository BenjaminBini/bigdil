import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/shared/color-value'
import { AppLink } from '@/components/shared/app-link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { MutedText } from '@/components/shared/muted-text'
import { ScrollContainer } from '@/components/shared/grid-table'
import { useUtilizationReport } from '@/api/hooks'
import { LoadingState, ErrorState } from '@/components/shared/page-container'

export function UtilizationTab() {
  const { data, isLoading, error } = useUtilizationReport()

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading utilization data" />

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
          <MutedText>No utilization data available yet</MutedText>
        ) : (
          <ScrollContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Employee</TableHead>
                  {allPeriods.map((period) => (
                    <HeadCell key={period} label={`P${period}`} align="center" width="60px" />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell className="sticky left-0 bg-background">
                      <AppLink to={`/employees/${employee.employeeId}`} bold>
                        {employee.employeeName}
                      </AppLink>
                    </TableCell>
                    {allPeriods.map((periodNumber) => {
                      const period = employee.periods.find((p) => p.periodNumber === periodNumber)
                      if (!period) return <TableCell key={periodNumber} align="center" className="text-muted-foreground">—</TableCell>
                      return (
                        <TableCell key={periodNumber} align="center">
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
          </ScrollContainer>
        )}
      </CardContent>
    </Card>
  )
}

