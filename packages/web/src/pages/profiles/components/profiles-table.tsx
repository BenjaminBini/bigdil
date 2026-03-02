import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import type { Profile } from '@/api/types'
import { computeMargin, computeMarginPct } from './profile-math'

interface ProfilesTableProps {
  profiles: Profile[]
  onEdit: (profile: Profile) => void
}

export function ProfilesTable({ profiles, onEdit }: ProfilesTableProps) {
  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Profile Name</TableHead>
            <TableHead className="text-right">Default Sell Rate/Day</TableHead>
            <TableHead className="text-right">Default Cost Rate/Day</TableHead>
            <TableHead className="text-right">Default Margin/Day</TableHead>
            <TableHead className="text-right">Default Margin %</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const margin = computeMargin(profile.defaultSellRatePerDay, profile.defaultCostRatePerDay)
            const marginPct = computeMarginPct(profile.defaultSellRatePerDay, profile.defaultCostRatePerDay)
            return (
              <TableRow key={profile.id} className="hover:bg-gray-50">
                <TableCell className="py-3.5 font-medium text-gray-900">{profile.name}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">{formatCurrency(profile.defaultSellRatePerDay)}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">{formatCurrency(profile.defaultCostRatePerDay)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium text-gray-900">{formatCurrency(margin)}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">{marginPct.toFixed(1)}%</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit(profile)} aria-label={`Edit ${profile.name}`}>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
