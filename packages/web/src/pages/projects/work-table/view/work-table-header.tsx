import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Lock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Legend } from '@/components/shared/legend'
import { Button } from '@/components/ui/button'
import { useCreateTask } from '@/api/hooks'

function WorkTableHeaderBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
      <div>{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  )
}

interface WorkTableHeaderProps {
  projectId: string
  projectName: string
  periodCount: number
}

function AddPhaseButton({ projectId }: { projectId: string }) {
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
        className="w-40 rounded border border-sky-400 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
      <Plus size={14} />
      Add Phase
    </Button>
  )
}

export function WorkTableHeader({ projectId, projectName, periodCount }: WorkTableHeaderProps) {
  return (
    <WorkTableHeaderBar
      left={
        <>
          <h1 className="text-base font-semibold text-slate-900">Work Table</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {projectName} - {periodCount} periods
          </p>
        </>
      }
      right={
        <>
          <AddPhaseButton projectId={projectId} />
          <Legend items={[
            { icon: <Lock size={8} color="#94a3b8" />, label: 'Frozen' },
            { swatch: 'bg-amber-100', swatchBorder: 'border-amber-200', label: 'Consolidation' },
            { swatch: 'bg-sky-100', swatchBorder: 'border-sky-200', label: 'Open' },
            { swatch: 'bg-white', swatchBorder: 'border-slate-200', label: 'Future' },
          ]} />
        </>
      }
    />
  )
}
