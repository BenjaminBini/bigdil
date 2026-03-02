import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableHead } from '@/components/shared/sortable-head'
import { formatCurrency, formatDate } from '@/lib/format'
import type { ClientListRow, ClientSortKey, SortDir } from './clients-list-model'

interface ClientsListTableProps {
  rows: ClientListRow[]
  sortKey: ClientSortKey
  sortDir: SortDir
  onSort: (key: ClientSortKey) => void
  onOpenClient: (clientId: string) => void
}

export function ClientsListTable({ rows, sortKey, sortDir, onSort, onOpenClient }: ClientsListTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <SortableHead label="Name" col="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Active Projects" col="activeProjects" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label="Total Contract Value" col="contractValue" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label="Margin Forecast" col="marginForecast" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <SortableHead label="Last Activity" col="lastActivity" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-gray-400">No clients found</TableCell>
            </TableRow>
          ) : (
            rows.map(({ client, activeProjects, totalProjects, contractValue, marginForecast, lastActivity }) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onOpenClient(client.id)}
              >
                <TableCell className="py-3.5 font-medium text-gray-900">
                  {client.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {totalProjects} project{totalProjects !== 1 ? 's' : ''}
                  </span>
                </TableCell>
                <TableCell className="text-right text-gray-700">{activeProjects}</TableCell>
                <TableCell className="text-right font-medium text-gray-900">{formatCurrency(contractValue)}</TableCell>
                <TableCell className="text-right text-gray-700">
                  {marginForecast != null ? formatCurrency(marginForecast) : '—'}
                </TableCell>
                <TableCell className="text-gray-500">{formatDate(lastActivity)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}