import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { quoteStatusColors } from '@/lib/constants'
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
          <p className="text-sm text-muted-foreground">Not used in any quotes</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead className="text-right">Sell Rate</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link to={`/projects/${entry.projectId}`} className="text-blue-600 hover:underline">
                      {entry.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{entry.quoteTitle}</TableCell>
                  <TableCell>
                    <Badge className={quoteStatusColors[entry.quoteStatus]}>{entry.quoteStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatDays(entry.days)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.sellRatePerDay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.revenueAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
