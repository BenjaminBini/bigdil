import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { toast } from 'sonner'
import type { PeriodStatus } from '@/api/types'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RowKind } from '@/lib/work-table/types'

interface WorkCellProps {
  days: number | undefined
  periodStatus: PeriodStatus
  rowKind: RowKind
}

export function WorkCell({ days, periodStatus, rowKind }: WorkCellProps) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isLeaf = rowKind === 'employee'
  const isEmpty = days === undefined || days === 0
  const isEditable = isLeaf && periodStatus !== 'FROZEN' && periodStatus !== 'CONSOLIDATION'

  function handleClick() {
    if (!isEditable) return
    setInputVal(days !== undefined && days !== 0 ? String(days) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setEditing(false)
    const parsed = parseFloat(inputVal.replace(',', '.'))
    if (!isNaN(parsed) && parsed !== (days ?? 0)) {
      toast.info(`Would save: ${parsed} days`)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const cellBg =
    periodStatus === 'FROZEN'
      ? 'bg-slate-50'
      : periodStatus === 'CONSOLIDATION'
        ? 'bg-amber-50'
        : periodStatus === 'OPEN'
          ? 'bg-sky-50'
          : 'bg-white'

  if (editing) {
    return (
      <td className={cn('border-b border-r border-slate-100 p-0 min-w-[56px] w-14', cellBg)}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="h-full w-full rounded-sm border border-sky-400 bg-white px-1.5 py-1 text-right text-xs font-mono outline-none"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </td>
    )
  }

  return (
    <td
      className={cn(
        'min-w-[56px] w-14 border-b border-r border-slate-100 px-1.5 py-1 text-right text-xs font-mono',
        cellBg,
        rowKind === 'phase' && 'font-semibold text-slate-700',
        rowKind === 'task' && 'font-medium text-slate-700',
        rowKind === 'grand-total' && 'font-bold text-slate-900',
        isEmpty && 'text-slate-300',
        isEditable && 'cursor-pointer transition-colors hover:border hover:border-sky-300 hover:bg-sky-100',
        (periodStatus === 'FROZEN' || periodStatus === 'CONSOLIDATION') && 'text-slate-500',
      )}
      onClick={handleClick}
      title={isEditable ? 'Click to edit' : undefined}
    >
      {isEmpty ? '—' : formatDays(days)}
    </td>
  )
}
