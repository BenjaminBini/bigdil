import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ThRight, TdRight } from '@/components/shared/table-cells'
import { DetailRow } from '@/components/shared/detail-row'
import { DetailGrid } from '@/components/shared/layouts'
import { ActiveBadge } from '@/pages/employees/components/active-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { EmployeeDetail } from '@/api/types'

interface EmployeeInfoCardsProps {
  employee: EmployeeDetail
}

export function EmployeeInfoCards({ employee }: EmployeeInfoCardsProps) {
  return (
    <DetailGrid>
      <Card>
        <CardHeader>
          <CardTitle>Employee Info</CardTitle>
        </CardHeader>
        <CardContent>
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

      <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Cost Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid To</TableHead>
                <ThRight>Cost Rate / Day</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employee.costRateHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(entry.validFrom)}</TableCell>
                  <TableCell>{entry.validTo ? formatDate(entry.validTo) : 'Current'}</TableCell>
                  <TdRight bold>{formatCurrency(entry.costRatePerDay)}</TdRight>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </DetailGrid>
  )
}
