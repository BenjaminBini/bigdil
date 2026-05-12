import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { TdDetail, TdNumericPrimary, ThRight } from '@/components/shared/table-cells'
import { VStack } from '@/components/shared/VStack'
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
  const { t } = useTranslation('pages')
  const asOfPeriodCode = snapshot.periodCode
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
    <VStack gap="xl" pt="md">
      <AlertBanner
        variant="info"
        icon={<Lock size={16} color="#3b82f6" />}
        title={t('snapshots.workTableTab.title')}
        description={t('snapshots.workTableTab.description', { periodCode: asOfPeriodCode })}
      />

      <Card variant="flush">
        <Table>
          <TableHeader>
            <TableRow variant="header">
              <TableHead>{t('snapshots.workTableTab.task')}</TableHead>
              <TableHead>{t('snapshots.workTableTab.profile')}</TableHead>
              <TableHead>{t('snapshots.workTableTab.employee')}</TableHead>
              <ThRight>{t('snapshots.workTableTab.totalDays')}</ThRight>
              <TableHead>{t('snapshots.workTableTab.type')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggRows.map((row) => (
              <TableRow
                key={`${row.taskId}|${row.profileId}|${row.employeeId ?? 'unassigned'}`}
                variant="interactive"
              >
                <TdDetail>{getTaskName(row.taskId)}</TdDetail>
                <TdDetail>{getProfileName(row.profileId)}</TdDetail>
                <TdDetail>{getEmployeeName(row.employeeId)}</TdDetail>
                <TdNumericPrimary>
                  {formatDays(row.totalDays)}
                </TdNumericPrimary>
                <TableCell>
                  <StatusBadge status={row.isActual ? 'ACTUAL' : 'PLANNED'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </VStack>
  )
}
