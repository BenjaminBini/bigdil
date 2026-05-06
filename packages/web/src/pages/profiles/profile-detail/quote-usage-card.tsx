import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TdRight, ThRight } from '@/components/shared/table-cells'
import { AppLink } from '@/components/shared/app-link'
import { StatusBadge } from '@/components/shared/status-badge'
import { MutedText } from '@/components/shared/muted-text'
import { formatCurrency, formatDays } from '@/lib/format'
import type { ProfileDetail } from '@/api/types'

interface QuoteUsageCardProps {
  usage: ProfileDetail['usage']
}

export function QuoteUsageCard({ usage }: QuoteUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Line Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {usage.length === 0 ? (
          <MutedText>Not used in any quotes</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <ThRight>Days</ThRight>
                <ThRight>Sell Rate</ThRight>
                <ThRight>Revenue</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <AppLink to={`/projects/${entry.projectId}`}>
                      {entry.projectName}
                    </AppLink>
                  </TableCell>
                  <TableCell>{entry.quoteTitle}</TableCell>
                  <TableCell>
                    <StatusBadge status={entry.quoteStatus} />
                  </TableCell>
                  <TdRight>{formatDays(entry.days)}</TdRight>
                  <TdRight>{formatCurrency(entry.sellRatePerDay)}</TdRight>
                  <TdRight>{formatCurrency(entry.revenueAmount)}</TdRight>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
