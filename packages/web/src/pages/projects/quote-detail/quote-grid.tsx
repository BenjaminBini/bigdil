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
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <colgroup>
        <col style={{ minWidth: 260 }} />
        <col style={{ width: 80 }} />
        <col style={{ width: 120 }} />
        <col style={{ width: 120 }} />
        <col style={{ width: 120 }} />
        <col style={{ width: 120 }} />
        <col style={{ width: 120 }} />
        <col style={{ width: 80 }} />
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
