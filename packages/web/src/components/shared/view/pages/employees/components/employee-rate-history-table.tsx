import type { Employee } from '@/api/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface EmployeeRateHistoryTableProps {
  employee: Employee
}

export function EmployeeRateHistoryTable({ employee }: EmployeeRateHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-md border bg-white shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="h-9 px-3 text-left font-medium text-gray-600">Valid From</th>
            <th className="h-9 px-3 text-left font-medium text-gray-600">Valid To</th>
            <th className="h-9 px-3 text-right font-medium text-gray-600">Cost Rate / Day</th>
          </tr>
        </thead>
        <tbody>
          {employee.costRateHistory.map((entry, index) => (
            <tr key={index} className="border-b transition-colors hover:bg-gray-50 last:border-0">
              <td className="px-3 py-2.5 text-gray-700">{formatDate(entry.validFrom)}</td>
              <td className="px-3 py-2.5 text-gray-500">
                {entry.validTo ? formatDate(entry.validTo) : <span className="font-medium text-green-700">Present</span>}
              </td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums text-gray-900">
                {formatCurrency(entry.costRatePerDay)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
