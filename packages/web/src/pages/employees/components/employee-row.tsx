import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { Employee } from '@/api/types'
import { ActiveBadge } from './active-badge'
import { EmployeeRateHistoryTable } from './employee-rate-history-table'

interface EmployeeRowProps {
  employee: Employee
  projectCount: number
}

export function EmployeeRow({ employee, projectCount }: EmployeeRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <TableRow className={cn('cursor-pointer hover:bg-gray-50', !employee.active && 'opacity-50')} onClick={() => setOpen((value) => !value)}>
          <TableCell className="w-8 pr-0">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={open ? 'Collapse details' : 'Expand details'}
                onClick={(event) => event.stopPropagation()}
              >
                {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className="py-3.5 font-medium text-gray-900">{employee.name}</TableCell>
          <TableCell><ActiveBadge active={employee.active} /></TableCell>
          <TableCell className="text-right tabular-nums text-gray-700">{formatCurrency(employee.currentCostRatePerDay)}</TableCell>
          <TableCell className="text-right text-gray-700">{projectCount === 0 ? <span className="text-gray-400">—</span> : projectCount}</TableCell>
        </TableRow>

        <CollapsibleContent asChild>
          <tr>
            <td colSpan={5} className="border-b p-0">
              <div className="bg-gray-50/70 px-6 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Cost Rate History</h3>
                  <Button variant="outline" size="sm" onClick={(event) => event.stopPropagation()}>
                    <Plus />
                    Add Rate Period
                  </Button>
                </div>
                <EmployeeRateHistoryTable employee={employee} />
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  )
}
