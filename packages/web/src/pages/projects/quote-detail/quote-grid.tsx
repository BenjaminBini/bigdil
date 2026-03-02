import type { QuoteGridRow } from './model'
import { QuoteGridHeader } from './quote-grid-header'
import { QuoteGridRowView } from './quote-grid-row'

interface QuoteGridProps {
  rows: QuoteGridRow[]
  isReadOnly: boolean
  collapsed: Record<string, boolean>
  onToggle: (rowId: string) => void
  hasChildrenSet: Set<string>
}

export function QuoteGrid({ rows, isReadOnly, collapsed, onToggle, hasChildrenSet }: QuoteGridProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <colgroup>
        <col className="min-w-[260px]" />
        <col className="w-[80px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[80px]" />
      </colgroup>

      <QuoteGridHeader />

      <tbody>
        {rows.map((row) => (
          <QuoteGridRowView
            key={row.id}
            row={row}
            isReadOnly={isReadOnly}
            collapsed={collapsed}
            onToggle={onToggle}
            hasChildrenSet={hasChildrenSet}
          />
        ))}
      </tbody>
    </table>
  )
}
