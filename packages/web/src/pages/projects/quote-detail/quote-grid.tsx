import { GridTable } from '@/components/shared/grid-table'
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
    <GridTable className="w-full text-sm">
      <colgroup>
        <col className="min-w-[260px]" />
        <col className="w-20" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-20" />
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
    </GridTable>
  )
}
