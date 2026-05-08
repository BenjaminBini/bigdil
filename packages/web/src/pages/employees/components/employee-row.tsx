import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
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
        <div className="bg-muted/30 px-6 py-4">{children}</div>
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
    <>
      <TableRow
        variant="interactive"
        className={cn(!employee.active && 'opacity-50')}
        onClick={() => setOpen(v => !v)}
      >
        <TableCell className="w-8 pr-0">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={open ? 'Collapse details' : 'Expand details'}
            onClick={(e) => e.stopPropagation()}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        </TableCell>
        <TdPrimary>{employee.name}</TdPrimary>
        <TableCell><ActiveBadge active={employee.active} /></TableCell>
        <TdNumeric>{formatCurrency(employee.currentCostRatePerDay)}</TdNumeric>
        <TdNumeric>{projectCount === 0 ? <NullCell /> : projectCount}</TdNumeric>
      </TableRow>

      {open && (
        <ExpandedDetail colSpan={5}>
          <FlexBetween className="mb-3">
            <SectionTitle>Cost Rate History</SectionTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setShowAddRate(true) }}
            >
              <Plus />
              Add Rate Period
            </Button>
          </FlexBetween>
          <EmployeeRateHistoryTable employee={employee} />
        </ExpandedDetail>
      )}

      <AddRateDialog
        employeeId={employee.id}
        employeeName={employee.name}
        open={showAddRate}
        onClose={() => setShowAddRate(false)}
      />
    </>
  )
}
