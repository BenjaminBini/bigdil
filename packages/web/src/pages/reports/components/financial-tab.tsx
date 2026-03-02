import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFinancialReport } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'

export function FinancialTab() {
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
              {data.map((row) => (
                <TableRow key={row.projectId}>
                  <TableCell>
                    <Link to={`/projects/${row.projectId}`} className="font-medium text-blue-600 hover:underline">
                      {row.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.contractValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.eacCost)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.marginForecast)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={marginBadgeClass(row.marginPercent)}>{row.marginPercent.toFixed(1)}%</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(row.actualCostToDate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.producedValueToDate)}</TableCell>
                </TableRow>
              ))}
              <TotalsRow data={data} />
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function TotalsRow({ data }: { data: Awaited<ReturnType<typeof useFinancialReport>>['data'] }) {
  if (!data) return null
  return (
    <TableRow className="border-t-2 font-bold">
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.contractValue, 0))}</TableCell>
      <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.eacCost, 0))}</TableCell>
      <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.marginForecast, 0))}</TableCell>
      <TableCell className="text-right">—</TableCell>
      <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.actualCostToDate, 0))}</TableCell>
      <TableCell className="text-right">{formatCurrency(data.reduce((s, r) => s + r.producedValueToDate, 0))}</TableCell>
    </TableRow>
  )
}

function marginBadgeClass(marginPercent: number): string {
  if (marginPercent >= 40) return 'bg-green-100 text-green-800'
  if (marginPercent >= 20) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}
