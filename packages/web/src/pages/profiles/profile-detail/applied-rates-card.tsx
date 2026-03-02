import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import type { ProfileDetail } from '@/api/types'

interface AppliedRatesCardProps {
  rates: ProfileDetail['appliedRates']
}

export function AppliedRatesCard({ rates }: AppliedRatesCardProps) {
  if (rates.length === 0) return null

  const uniqueRateKeys = [...new Set(rates.map((rate) => `${rate.costRate}-${rate.sellRate}`))]

  return (
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
            {uniqueRateKeys.map((key) => {
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
  )
}
