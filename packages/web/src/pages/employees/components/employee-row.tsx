import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight, Plus, Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { Employee } from '@/api/types'
import { useDeleteEmployee, useImpersonate, useCurrentUser, useUsers } from '@/api/hooks'
import { FlexBetween } from '@/components/shared/layouts'
import { SectionTitle } from '@/components/shared/page-title'
import { TdPrimary, TdNumeric, NullCell } from '@/components/shared/table-cells'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ActiveBadge } from './active-badge'
import { EmployeeRateHistoryTable } from './employee-rate-history-table'
import { AddRateDialog } from './add-rate-dialog'

function ExpandedDetail({ children, colSpan, isOpen }: { children: ReactNode; colSpan: number; isOpen: boolean }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn('!p-0', isOpen ? 'border-b' : 'border-b-transparent')}
      >
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden bg-muted/30">
            <div className="px-6 py-4">{children}</div>
          </div>
        </div>
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const deleteEmployee = useDeleteEmployee()
  const impersonate = useImpersonate()
  const { data: session } = useCurrentUser()
  const { data: users } = useUsers()

  const canDelete = projectCount === 0 && !deleteEmployee.isPending

  // Impersonation requires the caller's real role to be ADMIN and a User row
  // linked to this employee. Self-impersonation is rejected upstream.
  const isAdmin = session?.realUser.role === 'ADMIN'
  const linkedUser = users?.find((u) => u.employeeId === employee.id)
  const canImpersonate =
    isAdmin && !!linkedUser && linkedUser.id !== session?.realUser.id && !impersonate.isPending

  function handleImpersonate() {
    if (!linkedUser) return
    impersonate.mutate(linkedUser.id, {
      onSuccess: (next) => toast.success(`Now acting as ${next.user.name}`),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Impersonation failed'),
    })
  }

  function handleDelete() {
    deleteEmployee.mutate(employee.id, {
      onSuccess: () => toast.success(`${employee.name} deleted`),
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Delete failed'
        toast.error(message)
      },
    })
  }

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
            <ChevronRight
              size={16}
              className={cn('transition-transform duration-200 ease-out', open && 'rotate-90')}
            />
          </Button>
        </TableCell>
        <TdPrimary>{employee.name}</TdPrimary>
        <TableCell><ActiveBadge active={employee.active} /></TableCell>
        <TdNumeric>{formatCurrency(employee.currentCostRatePerDay)}</TdNumeric>
        <TdNumeric>{projectCount === 0 ? <NullCell /> : projectCount}</TdNumeric>
      </TableRow>

      <ExpandedDetail colSpan={5} isOpen={open}>
          <FlexBetween className="mb-3">
            <SectionTitle>Cost Rate History</SectionTitle>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canImpersonate}
                  title={
                    !linkedUser
                      ? 'Aucun compte utilisateur lié à cet employé'
                      : linkedUser.id === session?.realUser.id
                        ? 'Vous ne pouvez pas vous incarner vous-même'
                        : undefined
                  }
                  onClick={(e) => { e.stopPropagation(); handleImpersonate() }}
                >
                  <UserCog />
                  Incarner
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowAddRate(true) }}
              >
                <Plus />
                Add Rate Period
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!canDelete}
                title={canDelete ? undefined : 'Employee is assigned to projects — remove assignments first'}
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true) }}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </FlexBetween>
          <EmployeeRateHistoryTable employee={employee} />
      </ExpandedDetail>

      <AddRateDialog
        employeeId={employee.id}
        employeeName={employee.name}
        open={showAddRate}
        onClose={() => setShowAddRate(false)}
      />

      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={`Delete ${employee.name}?`}
        description="Cost rate history and any draft timesheets will be removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  )
}
