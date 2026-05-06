import { Lock } from 'lucide-react'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { ColorValue } from '@/components/shared/color-value'
import { CompactInput } from '@/components/shared/compact-input'
import { NullCell } from '@/components/shared/table-cells'
import { InlineStack } from '@/components/shared/inline-stack'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { QuoteGridRow } from './model'
import { QuoteTd } from '@/components/shared/quote-grid-cells'

interface QuoteGridRowViewProps {
  row: QuoteGridRow
  isReadOnly: boolean
  collapsed: Record<string, boolean>
  onToggle: (rowId: string) => void
  hasChildrenSet: Set<string>
}

function QuoteLabelTd({ children }: { children: React.ReactNode }) {
  return <td style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}>{children}</td>
}

function AvgLabel() {
  return <span style={{ marginRight: '0.25rem', fontSize: '10px', color: '#9ca3af' }}>avg</span>
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
    <tr className={cn('border-b transition-colors', isGrandTotal && 'border-t-2 border-t-gray-300 bg-gray-100 font-bold', isPhase && 'bg-gray-50/80', isTask && 'bg-white', isProfile && 'bg-white hover:bg-blue-50/30', !isGrandTotal && !isPhase && 'hover:bg-gray-50/50')}>
      <QuoteLabelTd>
        <TreeRowLabel
          label={row.label}
          depth={row.depth}
          indentPx={20}
          isExpanded={hasChildren ? !isCollapsed : undefined}
          onToggle={hasChildren ? () => onToggle(row.id) : undefined}
          className={cn(isPhase && 'font-semibold text-gray-900', isTask && 'font-medium text-gray-800', isProfile && 'text-sm text-gray-600', isGrandTotal && 'font-bold text-gray-900')}
        />
      </QuoteLabelTd>

      <QuoteTd className={cn(isAggregate ? 'font-semibold text-gray-900' : 'text-gray-700')}>{row.days}</QuoteTd>

      <QuoteTd className={cn('border-l border-gray-100', isGrandTotal ? 'text-gray-600' : isAggregate ? 'text-gray-400' : 'text-gray-700')}>
        <EditableRate value={row.sellRatePerDay} isReadOnly={isReadOnly} isGrandTotal={isGrandTotal} isFrozenRate={row.isFrozenRate} />
      </QuoteTd>
      <QuoteTd className={cn('border-r border-gray-100 font-medium', isAggregate ? 'text-gray-900' : 'text-gray-800')}>
        {formatCurrency(row.revenue)}
      </QuoteTd>

      <QuoteTd className={cn(isGrandTotal ? 'text-gray-600' : isAggregate ? 'text-gray-400' : 'text-gray-600')}>
        <EditableRate value={row.costRatePerDay} isReadOnly={isReadOnly} isGrandTotal={isGrandTotal} />
      </QuoteTd>
      <QuoteTd className={cn('border-r border-gray-100', isAggregate ? 'text-gray-700' : 'text-gray-600')}>
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
  isFrozenRate?: boolean
}

function EditableRate({ value, isReadOnly, isGrandTotal, isFrozenRate = false }: EditableRateProps) {
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
      {isFrozenRate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default"><Lock size={12} color="#f59e0b" /></span>
            </TooltipTrigger>
            <TooltipContent side="top">Frozen - matches existing project rate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
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
