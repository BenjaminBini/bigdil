import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { ColorValue } from '@/components/shared/color-value'
import { CompactInput } from '@/components/shared/compact-input'
import { NullCell } from '@/components/shared/table-cells'
import { InlineStack } from '@/components/shared/inline-stack'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { QuoteGridRow } from './model'
import { QuoteTd } from '@/components/shared/quote-grid-cells'

interface QuoteGridRowViewProps {
  row: QuoteGridRow
  isReadOnly: boolean
  collapsed: Record<string, boolean>
  onToggle: (rowId: string) => void
  hasChildrenSet: Set<string>
}

function AvgLabel() {
  return <span className="mr-1 text-[10px] text-muted-foreground">moy</span>
}

export function QuoteGridRowView({ row, isReadOnly, collapsed, onToggle, hasChildrenSet }: QuoteGridRowViewProps) {
  const isPhase = row.kind === 'phase'
  const isTask = row.kind === 'task'
  const isProfile = row.kind === 'profile'
  const isGrandTotal = row.kind === 'grand-total'
  const isAggregate = isPhase || isTask || isGrandTotal
  const hasChildren = hasChildrenSet.has(row.id)
  const isCollapsed = collapsed[row.id] ?? false

  const marginSentiment = row.margin < 0 ? 'negative' : row.marginPct !== null && row.marginPct >= 40 ? 'positive' : 'neutral'

  return (
    <tr className={cn(
      'border-b border-border/70 transition-colors',
      isGrandTotal && 'border-t-2 border-t-border bg-muted font-bold',
      isPhase && 'bg-muted/60',
      isTask && 'bg-card',
      isProfile && 'bg-card hover:bg-blue-50/30 dark:hover:bg-blue-950/20',
      !isGrandTotal && !isPhase && 'hover:bg-muted/40',
    )}>
      <td className="whitespace-nowrap px-3 py-2">
        <TreeRowLabel
          label={row.label}
          depth={row.depth}
          indentPx={20}
          isExpanded={hasChildren ? !isCollapsed : undefined}
          onToggle={hasChildren ? () => onToggle(row.id) : undefined}
          className={cn(
            isPhase && 'text-sm font-bold text-foreground',
            isTask && 'font-semibold text-foreground/80',
            isProfile && 'text-xs text-muted-foreground',
            isGrandTotal && 'font-bold text-foreground',
          )}
        />
      </td>

      <QuoteTd className={cn(isAggregate ? 'font-semibold text-foreground' : 'text-foreground/80')}>{row.days}</QuoteTd>

      <QuoteTd className={cn('border-l border-border/50', isAggregate ? 'text-muted-foreground' : 'text-foreground/80')}>
        <EditableRate value={row.sellRatePerDay} isReadOnly={isReadOnly} isGrandTotal={isGrandTotal} />
      </QuoteTd>
      <QuoteTd className={cn('border-r border-border/50 font-medium', isAggregate ? 'text-foreground' : 'text-foreground/90')}>
        {formatCurrency(row.revenue)}
      </QuoteTd>

      <QuoteTd className={cn(isAggregate ? 'text-muted-foreground' : 'text-foreground/70')}>
        <EditableRate value={row.costRatePerDay} isReadOnly={isReadOnly} isGrandTotal={isGrandTotal} />
      </QuoteTd>
      <QuoteTd className={cn('border-r border-border/50', isAggregate ? 'text-foreground/80' : 'text-foreground/70')}>
        {formatCurrency(row.cost)}
      </QuoteTd>

      <QuoteTd bold>
        <ColorValue value={row.margin} sentiment={marginSentiment} format="currency" />
      </QuoteTd>
      <QuoteTd>
        {row.marginPct !== null ? <ColorValue value={row.marginPct} sentiment={marginSentiment} format="percent" /> : '—'}
      </QuoteTd>
    </tr>
  )
}

interface EditableRateProps {
  value: number | null
  isReadOnly: boolean
  isGrandTotal: boolean
}

function EditableRate({ value, isReadOnly, isGrandTotal }: EditableRateProps) {
  if (value === null) return <NullCell />

  if (isGrandTotal) {
    return (
      <span>
        <AvgLabel />
        {formatCurrency(Math.round(value))}
      </span>
    )
  }

  return (
    <InlineStack justify="end">
      {isReadOnly ? (
        formatCurrency(value)
      ) : (
        <CompactInput
          type="number"
          defaultValue={value}
          min={0}
        />
      )}
    </InlineStack>
  )
}
