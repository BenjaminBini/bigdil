import { useState } from 'react'
import { ChevronDown, ChevronRight, Download, Plus } from 'lucide-react'
import { useReferenceData } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Employee } from '@/api/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Hardcoded assigned project counts per employee id
const assignedProjects: Record<string, number> = {
  e1: 1, // Jean Martin
  e2: 1, // Sophie Bernard
  e3: 1, // Thomas Petit
  e4: 1, // Paul Girard
  e5: 0, // Isabelle Faure
}

function ActiveBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Active
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
      Inactive
    </Badge>
  )
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false)
  const projectCount = assignedProjects[employee.id] ?? 0

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        {/* Main row */}
        <TableRow
          className={cn(
            'cursor-pointer hover:bg-gray-50',
            !employee.active && 'opacity-50',
          )}
          onClick={() => setOpen((o) => !o)}
        >
          <TableCell className="w-8 pr-0">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={open ? 'Collapse details' : 'Expand details'}
                onClick={(e) => e.stopPropagation()}
              >
                {open ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className="font-medium text-gray-900 py-3.5">
            {employee.name}
          </TableCell>
          <TableCell>
            <ActiveBadge active={employee.active} />
          </TableCell>
          <TableCell className="text-right tabular-nums text-gray-700">
            {formatCurrency(employee.currentCostRatePerDay)}
          </TableCell>
          <TableCell className="text-right text-gray-700">
            {projectCount === 0 ? (
              <span className="text-gray-400">—</span>
            ) : (
              <span>{projectCount}</span>
            )}
          </TableCell>
        </TableRow>

        {/* Expanded detail row */}
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={5} className="p-0 border-b">
              <div className="bg-gray-50/70 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Cost Rate History
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus />
                    Add Rate Period
                  </Button>
                </div>

                <div className="rounded-md border bg-white overflow-hidden shadow-xs">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="h-9 px-3 text-left font-medium text-gray-600">
                          Valid From
                        </th>
                        <th className="h-9 px-3 text-left font-medium text-gray-600">
                          Valid To
                        </th>
                        <th className="h-9 px-3 text-right font-medium text-gray-600">
                          Cost Rate / Day
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.costRateHistory.map((entry, idx) => (
                        <tr
                          key={idx}
                          className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-gray-700">
                            {formatDate(entry.validFrom)}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">
                            {entry.validTo ? formatDate(entry.validTo) : (
                              <span className="text-green-700 font-medium">Present</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-medium text-gray-900">
                            {formatCurrency(entry.costRatePerDay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  )
}

export default function EmployeesPage() {
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !refData) return <div className="p-6">Error loading data</div>

  const { employees } = refData

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage employees and their cost rate history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download />
            Export CSV
          </Button>
          <Button>
            <Plus />
            New Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-8 pr-0" />
              <TableHead>Name</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Current Cost Rate/Day</TableHead>
              <TableHead className="text-right">Assigned Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
