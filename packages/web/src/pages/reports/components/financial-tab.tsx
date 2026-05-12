import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/shared/color-value'
import { AppLink } from '@/components/shared/app-link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ThRight, TdRight } from '@/components/shared/table-cells'
import { MutedText } from '@/components/shared/muted-text'
import { useFinancialReport } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { LoadingState, ErrorState } from '@/components/shared/page-container'

export function FinancialTab() {
  const { t } = useTranslation('pages')
  const { data, isLoading, error } = useFinancialReport()

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={t('reports.financial.errorLoading')} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports.financial.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <MutedText>{t('reports.financial.noData')}</MutedText>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.financial.table.project')}</TableHead>
                <TableHead>{t('reports.financial.table.client')}</TableHead>
                <ThRight>{t('reports.financial.table.contractValue')}</ThRight>
                <ThRight>{t('reports.financial.table.eacCost')}</ThRight>
                <ThRight>{t('reports.financial.table.marginForecast')}</ThRight>
                <ThRight>{t('reports.financial.table.marginPct')}</ThRight>
                <ThRight>{t('reports.financial.table.actualCost')}</ThRight>
                <ThRight>{t('reports.financial.table.producedValue')}</ThRight>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.projectId}>
                  <TableCell>
                    <AppLink to={`/projects/${row.projectId}`} bold>
                      {row.projectName}
                    </AppLink>
                  </TableCell>
                  <TableCell>{row.clientName}</TableCell>
                  <TdRight>{formatCurrency(row.contractValue)}</TdRight>
                  <TdRight>{formatCurrency(row.eacCost)}</TdRight>
                  <TdRight bold>{formatCurrency(row.marginForecast)}</TdRight>
                  <TdRight>
                    <ColorValue
                      value={row.marginPercent}
                      format="percent"
                      sentiment={row.marginPercent >= 40 ? 'positive' : row.marginPercent >= 20 ? 'warning' : 'negative'}
                    />
                  </TdRight>
                  <TdRight>{formatCurrency(row.actualCostToDate)}</TdRight>
                  <TdRight>{formatCurrency(row.producedValueToDate)}</TdRight>
                </TableRow>
              ))}
              <TotalsRow data={data} totalLabel={t('reports.financial.table.total')} />
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

interface TotalsRowProps {
  data: Awaited<ReturnType<typeof useFinancialReport>>['data']
  totalLabel: string
}

function TotalsRow({ data, totalLabel }: TotalsRowProps) {
  if (!data) return null
  return (
    <TableRow variant="total">
      <TableCell colSpan={2}>{totalLabel}</TableCell>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.contractValue, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.eacCost, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.marginForecast, 0))}</TdRight>
      <TdRight>—</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.actualCostToDate, 0))}</TdRight>
      <TdRight>{formatCurrency(data.reduce((s, r) => s + r.producedValueToDate, 0))}</TdRight>
    </TableRow>
  )
}
