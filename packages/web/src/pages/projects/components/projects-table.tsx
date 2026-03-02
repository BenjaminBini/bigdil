import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import type { ProjectListItem } from '@/api/types'
import { projectStatusColors, projectStatusLabels } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'

interface ProjectsTableProps {
  rows: ProjectListItem[]
}

export function ProjectsTable({ rows }: ProjectsTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <HeadCell label="Client" />
            <HeadCell label="Project" />
            <HeadCell label="Status" />
            <HeadCell label="Contract Value" className="text-right" />
            <HeadCell label="Active Period" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-gray-400">No projects found</TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/projects/${row.id}`)}>
                <TableCell className="py-3.5 text-sm text-gray-500">{row.clientName ?? <span className="text-gray-400">—</span>}</TableCell>
                <TableCell className="py-3.5 font-medium text-gray-900">{row.name}</TableCell>
                <TableCell>
                  <Badge className={projectStatusColors[row.status]}>{projectStatusLabels[row.status]}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">{formatCurrency(row.contractValue)}</TableCell>
                <TableCell>
                  {row.startDate || row.endDate ? (
                    <span className="text-sm text-gray-700">
                      {formatDate(row.startDate)} - {formatDate(row.endDate)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}