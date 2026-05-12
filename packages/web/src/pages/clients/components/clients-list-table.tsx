import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableHead } from '@/components/shared/sortable-head'
import { Card } from '@/components/ui/card'
import { TdPrimary, TdNumeric, TdNumericPrimary, TdDetail, NullCell } from '@/components/shared/table-cells'
import { EmptyRow } from '@/components/shared/empty-row'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ReactNode } from 'react'
import type { ClientListRow, ClientSortKey, SortDir } from './clients-list-model'

function AnnotationText({ children }: { children: ReactNode }) {
  return <span className="ml-2 text-xs font-normal text-gray-400">{children}</span>
}

interface ClientsListTableProps {
  rows: ClientListRow[]
  sortKey: ClientSortKey
  sortDir: SortDir
  onSort: (key: ClientSortKey) => void
  onOpenClient: (clientId: string) => void
}

export function ClientsListTable({ rows, sortKey, sortDir, onSort, onOpenClient }: ClientsListTableProps) {
  const { t } = useTranslation('pages')
  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <SortableHead label={t('clients.table.name')} col="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label={t('clients.table.activeProjects')} col="activeProjects" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label={t('clients.table.contractValue')} col="contractValue" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label={t('clients.table.marginForecast')} col="marginForecast" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label={t('clients.table.lastActivity')} col="lastActivity" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message={t('clients.empty')} />
          ) : (
            rows.map(({ client, activeProjects, totalProjects, contractValue, marginForecast, lastActivity }) => (
              <TableRow
                key={client.id}
                variant="interactive"
                onClick={() => onOpenClient(client.id)}
              >
                <TdPrimary>
                  {client.name}
                  <AnnotationText>
                    {t('clients.table.projectsCount', { count: totalProjects })}
                  </AnnotationText>
                </TdPrimary>
                <TdNumeric>{activeProjects}</TdNumeric>
                <TdNumericPrimary>{formatCurrency(contractValue)}</TdNumericPrimary>
                <TdNumeric>
                  {marginForecast != null ? formatCurrency(marginForecast) : <NullCell />}
                </TdNumeric>
                <TdDetail>{formatDate(lastActivity)}</TdDetail>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
