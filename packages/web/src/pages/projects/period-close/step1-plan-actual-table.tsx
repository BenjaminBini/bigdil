import { cn } from '@/lib/utils'
import { formatDays } from '@/lib/format'
import type { TimesheetStatus } from '@/api/types'

interface PlanActualRow {
  id: string
  employee: string
  task: string
  plannedDays: number
  actualDays: number
  status: TimesheetStatus
}

interface Step1PlanActualTableProps {
  periodNumber: number
  rows: PlanActualRow[]
}

export function Step1PlanActualTable({ periodNumber, rows }: Step1PlanActualTableProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Plan vs. Actual - Period {periodNumber}</h3>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <Head label="Employee" align="left" />
              <Head label="Task" align="left" />
              <Head label="Planned Days" align="right" />
              <Head label="Actual Days" align="right" />
              <Head label="Delta" align="right" />
              <Head label="Status" align="left" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const delta = row.actualDays - row.plannedDays
              return (
                <tr key={row.id} className="border-b hover:bg-gray-50 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{row.employee}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.task}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{formatDays(row.plannedDays)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{formatDays(row.actualDays)}</td>
                  <td
                    className={cn(
                      'px-4 py-2.5 text-right tabular-nums font-medium',
                      delta > 0 ? 'text-amber-600' : delta < 0 ? 'text-blue-600' : 'text-gray-400',
                    )}
                  >
                    {delta === 0 ? '—' : delta > 0 ? `+${formatDays(delta)}` : formatDays(delta)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={statusPillClass(row.status)}>{row.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function statusPillClass(status: TimesheetStatus): string {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  if (status === 'APPROVED') return `${base} bg-green-100 text-green-800`
  if (status === 'SUBMITTED') return `${base} bg-amber-100 text-amber-800`
  return `${base} bg-gray-100 text-gray-700`
}

function Head({ label, align }: { label: string; align: 'left' | 'right' }) {
  return (
    <th className={cn('px-4 py-2.5 font-medium text-gray-600', align === 'right' ? 'text-right' : 'text-left')}>
      {label}
    </th>
  )
}
