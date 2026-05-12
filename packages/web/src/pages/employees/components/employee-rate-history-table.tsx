import { useTranslation } from 'react-i18next'
import type { Employee } from '@/api/types'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { ColorValue } from '@/components/shared/color-value'
import { TdSecondary, TdDetail, TdNumericPrimary } from '@/components/shared/table-cells'
import { formatCurrency, formatDate } from '@/lib/format'

interface EmployeeRateHistoryTableProps {
  employee: Employee
}

export function EmployeeRateHistoryTable({ employee }: EmployeeRateHistoryTableProps) {
  const { t } = useTranslation('pages')
  return (
    <Card variant="flush">
      <Table variant="compact">
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label={t('employees.rateHistory.validFrom')} variant="compact" />
            <HeadCell label={t('employees.rateHistory.validTo')} variant="compact" />
            <HeadCell label={t('employees.rateHistory.costRatePerDay')} variant="compact" align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {employee.costRateHistory.map((entry, index) => (
            <TableRow key={index}>
              <TdSecondary>{formatDate(entry.validFrom)}</TdSecondary>
              <TdDetail>
                {entry.validTo ? formatDate(entry.validTo) : <ColorValue value={t('employees.rateHistory.present')} sentiment="positive" />}
              </TdDetail>
              <TdNumericPrimary>{formatCurrency(entry.costRatePerDay)}</TdNumericPrimary>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
