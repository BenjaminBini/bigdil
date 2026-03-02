import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DetailRow } from '@/components/shared/detail-row'
import { ActiveBadge } from '@/pages/employees/components/active-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { EmployeeDetail } from '@/api/types'

interface EmployeeInfoCardsProps {
  employee: EmployeeDetail
}

export function EmployeeInfoCards({ employee }: EmployeeInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Employee Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            label="Status"
            value={<ActiveBadge active={employee.active} />}
          />
          <DetailRow
            label="Current Cost Rate"
            value={`${formatCurrency(employee.currentCostRatePerDay)}/day`}
          />
        </CardContent>
      </Card>

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
              {employee.costRateHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(entry.validFrom)}</TableCell>
                  <TableCell>{entry.validTo ? formatDate(entry.validTo) : 'Current'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(entry.costRatePerDay)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
