import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/shared/color-value'
import { AppLink } from '@/components/shared/app-link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ThRight, TdRight } from '@/components/shared/table-cells'
import { MutedText } from '@/components/shared/muted-text'
import { useFinancialReport } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { LoadingState, ErrorState } from '@/components/shared/page-container'

export function FinancialTab() {
  const { data, isLoading, error } = useFinancialReport()

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading financial data" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <MutedText>No financial data available yet</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <ThRight>Contract Value</ThRight>
                <ThRight>EAC Cost</ThRight>
                <ThRight>Margin Forecast</ThRight>
                <ThRight>Margin %</ThRight>
                <ThRight>Actual Cost</ThRight>
                <ThRight>Produced Value</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.projectId}>
                  <TableCell>
                    <AppLink to={`/projects/${row.projectId}`} bold>
                      {row.projectName}
                    </AppLink>
                  </TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TdRight>{formatCurrency(row.contractValue)}</TdRight>
                  <TdRight>{formatCurrency(row.eacCost)}</TdRight>
                  <TdRight bold>{formatCurrency(row.marginForecast)}</TdRight>
                  <TdRight>
                    <ColorValue
                      value={row.marginPercent}
                      format="percent"
                      sentiment={row.marginPercent >= 40 ? 'positive' : row.marginPercent >= 20 ? 'warning' : 'negative'}
                    />
                  </TdRight>
                  <TdRight>{formatCurrency(row.actualCostToDate)}</TdRight>
                  <TdRight>{formatCurrency(row.producedValueToDate)}</TdRight>
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
    <TableRow variant="total">
      <TableCell colSpan={2}>Total</TableCell>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.contractValue, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.eacCost, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.marginForecast, 0))}</TdRight>
      <TdRight>—</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.actualCostToDate, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.producedValueToDate, 0))}</TdRight>
    </TableRow>
  )
}

