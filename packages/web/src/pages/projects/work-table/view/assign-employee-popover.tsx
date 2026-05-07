import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Employee } from '@/api/types'

interface AssignEmployeePopoverProps {
  employees: Employee[]
  onAssign: (employeeId: string) => void
}

export function AssignEmployeePopover({ employees, onAssign }: AssignEmployeePopoverProps) {
  const [open, setOpen] = useState(false)

  const active = employees.filter((e) => e.active)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
          title="Assigner un collaborateur"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="start">
        <p className="px-2 py-1 text-xs font-medium text-slate-500">Assigner à</p>
        <div className="max-h-52 overflow-y-auto">
          {active.map((emp) => (
            <button
              key={emp.id}
              className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100"
              onClick={() => { onAssign(emp.id); setOpen(false) }}
            >
              {emp.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
