import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TreeRowLabelProps {
  label: string
  depth?: number
  indentPx?: number
  isExpanded?: boolean
  onToggle?: () => void
  maxLabelWidth?: string
  className?: string
}

export function TreeRowLabel({
  label,
  depth = 0,
  indentPx = 16,
  isExpanded,
  onToggle,
  maxLabelWidth = '210px',
  className,
}: TreeRowLabelProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {depth > 0 && <span style={{ display: 'inline-block', width: depth * indentPx }} />}
      {onToggle ? (
        <button
          onClick={onToggle}
          className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
      ) : (
        depth > 0 && <span className="inline-block w-[18px] shrink-0" />
      )}
      <span className="truncate" style={{ maxWidth: maxLabelWidth }} title={label}>
        {label}
      </span>
    </div>
  )
}
