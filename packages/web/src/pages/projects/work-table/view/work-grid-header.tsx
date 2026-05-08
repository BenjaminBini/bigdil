import { useState, useRef, type ReactNode } from 'react'
import { Lock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Period } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCreateTask } from '@/api/hooks'

function HeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-muted text-muted-foreground">{children}</tr>
}

function PeriodLabelStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-0.5">{children}</div>
}

function PeriodNumberLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold">{children}</span>
}

function PeriodDateLabel({ children }: { children: ReactNode }) {
  return <span className="text-[10px] font-normal opacity-70">{children}</span>
}

function AddPhaseInline({ projectId }: { projectId: string }) {
  const createTask = useCreateTask(projectId)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = name.trim()
    if (trimmed) {
      createTask.mutate({ name: trimmed, parentTaskId: null }, {
        onSuccess: () => toast.success(`Phase "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setName('')
    setAdding(false)
  }

  if (adding) {
    return (
      <input
        ref={inputRef}
        autoFocus
        placeholder="Nom de la phase…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.blur()
          if (e.key === 'Escape') { setName(''); setAdding(false) }
        }}
        className="w-32 rounded border border-sky-400 bg-background px-1.5 py-0.5 text-xs font-normal text-foreground outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="ml-2 inline-flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
      title="Ajouter une phase"
    >
      <Plus size={14} />
    </button>
  )
}

interface WorkGridHeaderProps {
  projectId: string
  periods: Period[]
}

export function WorkGridHeader({ projectId, periods }: WorkGridHeaderProps) {
  return (
    <thead>
      <HeaderRow>
        <StickyColumnCell as="th" zIndex={30} shadowColor="var(--color-border)" className="border-b border-border bg-muted text-left font-semibold">
          <span className="flex items-center">
            Task / Phase
            <AddPhaseInline projectId={projectId} />
          </span>
        </StickyColumnCell>

        {periods.map((period) => {
          const isFrozen = period.status === 'FROZEN'
          const isConsolidation = period.status === 'CONSOLIDATION'
          const isOpen = period.status === 'OPEN'

          return (
            <th
              key={period.id}
              className={cn(
                'min-w-[56px] w-14 whitespace-nowrap border-b border-r border-border/70 px-1 py-1 text-center',
                isFrozen && 'bg-muted text-muted-foreground',
                isConsolidation && 'bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                isOpen && 'bg-sky-100 font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
                !isFrozen && !isConsolidation && !isOpen && 'bg-muted text-muted-foreground',
              )}
            >
              <PeriodLabelStack>
                <PeriodNumberLabel>
                  W{period.periodNumber}
                  {(isFrozen || isConsolidation) && (
                    <Lock className="ml-0.5 inline-block size-2.5 opacity-60" />
                  )}
                </PeriodNumberLabel>
                <PeriodDateLabel>{formatShortDate(period.startDate)}</PeriodDateLabel>
              </PeriodLabelStack>
            </th>
          )
        })}
      </HeaderRow>
    </thead>
  )
}
