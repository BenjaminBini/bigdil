import { useState } from 'react'
import type { ReactNode } from 'react'
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
import { FlexBetween } from '@/components/shared/layouts'
import { SectionTitle } from '@/components/shared/page-title'
import { TdPrimary, TdNumeric, NullCell } from '@/components/shared/table-cells'
import { ActiveBadge } from './active-badge'
import { EmployeeRateHistoryTable } from './employee-rate-history-table'
import { AddRateDialog } from './add-rate-dialog'

function ExpandedDetail({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b p-0">
        <div className="bg-gray-50/70 px-6 py-4">{children}</div>
      </td>
    </tr>
  )
}

interface EmployeeRowProps {
  employee: Employee
  projectCount: number
}

export function EmployeeRow({ employee, projectCount }: EmployeeRowProps) {
  const [open, setOpen] = useState(false)
  const [showAddRate, setShowAddRate] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <TableRow variant="interactive" className={cn(!employee.active && 'opacity-50')} onClick={() => setOpen((value) => !value)}>
          <TableCell className="w-8 pr-0">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={open ? 'Collapse details' : 'Expand details'}
                onClick={(event) => event.stopPropagation()}
              >
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TdPrimary>{employee.name}</TdPrimary>
          <TableCell><ActiveBadge active={employee.active} /></TableCell>
          <TdNumeric>{formatCurrency(employee.currentCostRatePerDay)}</TdNumeric>
          <TdNumeric>{projectCount === 0 ? <NullCell /> : projectCount}</TdNumeric>
        </TableRow>

        <CollapsibleContent asChild>
          <ExpandedDetail colSpan={5}>
            <FlexBetween className="mb-3">
              <SectionTitle>Cost Rate History</SectionTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => { event.stopPropagation(); setShowAddRate(true) }}
              >
                <Plus />
                Add Rate Period
              </Button>
            </FlexBetween>
            <EmployeeRateHistoryTable employee={employee} />
          </ExpandedDetail>
        </CollapsibleContent>
      </>
    </Collapsible>

    <AddRateDialog
      employeeId={employee.id}
      employeeName={employee.name}
      open={showAddRate}
      onClose={() => setShowAddRate(false)}
    />
  )
}
