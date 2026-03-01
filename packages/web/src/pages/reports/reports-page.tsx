import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { useFinancialReport, useUtilizationReport } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'

function FinancialTab() {
  const { data, isLoading, error } = useFinancialReport()

  if (isLoading) return <div className="py-4">Loading financial data...</div>
  if (error || !data) return <div className="py-4">Error loading financial data</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No financial data available yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Contract Value</TableHead>
                <TableHead className="text-right">EAC Cost</TableHead>
                <TableHead className="text-right">Margin Forecast</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Actual Cost</TableHead>
                <TableHead className="text-right">Produced Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.projectId}>
                  <TableCell>
                    <Link to={`/projects/${row.projectId}`} className="text-blue-600 hover:underline font-medium">
                      {row.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.contractValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.eacCost)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.marginForecast)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={row.marginPercent >= 40 ? 'bg-green-100 text-green-800' : row.marginPercent >= 20 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                      {row.marginPercent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(row.actualCostToDate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.producedValueToDate)}</TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="font-bold border-t-2">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.contractValue, 0))}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.eacCost, 0))}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.marginForecast, 0))}</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.actualCostToDate, 0))}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.producedValueToDate, 0))}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function UtilizationTab() {
  const { data, isLoading, error } = useUtilizationReport()

  if (isLoading) return <div className="py-4">Loading utilization data...</div>
  if (error || !data) return <div className="py-4">Error loading utilization data</div>

  // Collect all unique period numbers
  const allPeriods = [...new Set(data.flatMap(e => e.periods.map(p => p.periodNumber)))].sort((a, b) => a - b)

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
                  {allPeriods.map(p => (
                    <TableHead key={p} className="text-center min-w-[60px]">P{p}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(emp => (
                  <TableRow key={emp.employeeId}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      <Link to={`/employees/${emp.employeeId}`} className="text-blue-600 hover:underline">
                        {emp.employeeName}
                      </Link>
                    </TableCell>
                    {allPeriods.map(pNum => {
                      const period = emp.periods.find(p => p.periodNumber === pNum)
                      if (!period) return <TableCell key={pNum} className="text-center text-muted-foreground">—</TableCell>
                      const pct = period.utilization
                      const color = pct >= 80 ? 'bg-green-100 text-green-800' :
                                    pct >= 50 ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                      return (
                        <TableCell key={pNum} className="text-center">
                          <Badge className={`${color} text-xs`}>{pct.toFixed(0)}%</Badge>
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

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reports" subtitle="Financial and utilization analysis" />

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>
        <TabsContent value="financial" className="mt-4">
          <FinancialTab />
        </TabsContent>
        <TabsContent value="utilization" className="mt-4">
          <UtilizationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
