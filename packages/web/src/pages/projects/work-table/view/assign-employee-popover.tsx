import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Employee } from '@/api/types'

interface AssignEmployeePopoverProps {
  employees: Employee[]
  onAssign: (employeeId: string) => void
  /** Employee ids already assigned on the same (task, profile) — filtered from the picker. */
  excludeIds?: string[]
  /** Tooltip on the trigger. */
  triggerTitle?: string
}

export function AssignEmployeePopover({ employees, onAssign, excludeIds, triggerTitle }: AssignEmployeePopoverProps) {
  const [open, setOpen] = useState(false)

  const excluded = new Set(excludeIds ?? [])
  const available = employees.filter((e) => e.active && !excluded.has(e.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={triggerTitle ?? 'Assigner un collaborateur'}
          onClick={(e) => e.stopPropagation()}
          className="ml-1 inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus size={10} strokeWidth={2.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-1"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-2 py-1 text-xs font-medium text-slate-500">Assigner à</p>
        <div className="max-h-52 overflow-y-auto">
          {available.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">Tous les collaborateurs sont déjà affectés</p>
          ) : (
            available.map((emp) => (
              <button
                key={emp.id}
                className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onAssign(emp.id)
                  setOpen(false)
                }}
              >
                {emp.name}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
