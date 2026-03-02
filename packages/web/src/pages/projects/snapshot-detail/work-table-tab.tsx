import { Lock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertBanner } from '@/components/shared/alert-banner'
import { formatDays } from '@/lib/format'
import type { Snapshot } from '@/api/types'

interface WorkTableTabProps {
  snapshot: Snapshot
  getTaskName: (id: string) => string
  getProfileName: (id: string) => string
  getEmployeeName: (id: string | null) => string
}

export function WorkTableTab({ snapshot, getTaskName, getProfileName, getEmployeeName }: WorkTableTabProps) {
  const asOfPeriodNumber = snapshot.periodNumber
  const rows = snapshot.workTableRows

  const aggMap = new Map<
    string,
    { taskId: string; profileId: string; employeeId: string | null; totalDays: number; isActual: boolean }
  >()

  rows.forEach((r) => {
    const key = `${r.taskId}|${r.profileId}|${r.employeeId ?? 'unassigned'}`
    if (!aggMap.has(key)) {
      aggMap.set(key, {
        taskId: r.taskId,
        profileId: r.profileId,
        employeeId: r.employeeId,
        totalDays: 0,
        isActual: r.actualDays != null,
      })
    }
    const entry = aggMap.get(key)!
    entry.totalDays += r.actualDays ?? r.plannedDays
  })

  const aggRows = Array.from(aggMap.values())

  return (
    <div className="pt-4 space-y-4">
      <AlertBanner
        variant="info"
        icon={<Lock className="size-4 text-blue-500" />}
        title="Work table as-of this snapshot — READ ONLY"
        description={`This is a frozen view. Showing all periods up to Period ${asOfPeriodNumber}.`}
      />

      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Task</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Total Days</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggRows.map((row) => (
              <TableRow
                key={`${row.taskId}|${row.profileId}|${row.employeeId ?? 'unassigned'}`}
                className="hover:bg-gray-50"
              >
                <TableCell className="text-gray-700 text-sm">{getTaskName(row.taskId)}</TableCell>
                <TableCell className="text-gray-600 text-sm">{getProfileName(row.profileId)}</TableCell>
                <TableCell className="text-gray-600 text-sm">{getEmployeeName(row.employeeId)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium text-gray-900">
                  {formatDays(row.totalDays)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.isActual ? 'ACTUAL' : 'PLANNED'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
