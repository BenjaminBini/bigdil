import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ThRight, TdPrimary, TdNumeric, TdNumericPrimary } from '@/components/shared/table-cells'
import { formatCurrency } from '@/lib/format'
import type { Profile } from '@/api/types'
import { computeMargin, computeMarginPct } from './profile-math'

interface ProfilesTableProps {
  profiles: Profile[]
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
}

export function ProfilesTable({ profiles, onEdit, onDelete }: ProfilesTableProps) {
  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <TableHead>Profile Name</TableHead>
            <ThRight>Default Sell Rate/Day</ThRight>
            <ThRight>Default Cost Rate/Day</ThRight>
            <ThRight>Default Margin/Day</ThRight>
            <ThRight>Default Margin %</ThRight>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const margin = computeMargin(profile.defaultSellRatePerDay, profile.defaultCostRatePerDay)
            const marginPct = computeMarginPct(profile.defaultSellRatePerDay, profile.defaultCostRatePerDay)
            return (
              <TableRow key={profile.id} variant="interactive">
                <TdPrimary>{profile.name}</TdPrimary>
                <TdNumeric>{formatCurrency(profile.defaultSellRatePerDay)}</TdNumeric>
                <TdNumeric>{formatCurrency(profile.defaultCostRatePerDay)}</TdNumeric>
                <TdNumericPrimary>{formatCurrency(margin)}</TdNumericPrimary>
                <TdNumeric>{marginPct.toFixed(1)}%</TdNumeric>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit(profile)} aria-label={`Edit ${profile.name}`}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(profile)}
                      aria-label={`Supprimer ${profile.name}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
