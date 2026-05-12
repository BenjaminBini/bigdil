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

// Render `depth` faint vertical guide lines so each indent level reads as a
// distinct level of the tree. Last guide is the "active" one (slightly
// darker) — drawn at the cell that owns the row.
function IndentGuides({ depth, indentPx }: { depth: number; indentPx: number }) {
  if (depth <= 0) return null
  return (
    <span
      className="inline-flex shrink-0 self-stretch"
      style={{ width: depth * indentPx }}
      aria-hidden
    >
      {Array.from({ length: depth }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block self-stretch',
            i === depth - 1 ? 'border-l border-border/70' : 'border-l border-border/30',
          )}
          style={{ width: indentPx }}
        />
      ))}
    </span>
  )
}

export function TreeRowLabel({
  label,
  depth = 0,
  indentPx = 18,
  isExpanded,
  onToggle,
  maxLabelWidth = '210px',
  className,
}: TreeRowLabelProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <IndentGuides depth={depth} indentPx={indentPx} />
      {onToggle ? (
        <button
          onClick={onToggle}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
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
