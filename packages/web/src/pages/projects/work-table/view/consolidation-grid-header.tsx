import type { ReactNode } from 'react'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { cn } from '@/lib/utils'
import { FROZEN_COLS, FROZEN_GROUPS, FROZEN_SUBGROUPS } from '@/lib/work-table/frozen'

function GroupHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-muted text-muted-foreground">{children}</tr>
}

function SubgroupHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-muted text-muted-foreground">{children}</tr>
}

function ColumnHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-muted/50 text-muted-foreground">{children}</tr>
}

export function ConsolidationGridHeader() {
  return (
    <thead>
      <GroupHeaderRow>
        <StickyColumnCell as="th" zIndex={30} shadowColor="var(--color-border)" className="border-b border-border/70 bg-muted text-left font-semibold" rowSpan={3}>
          Task / Phase
        </StickyColumnCell>
        {FROZEN_GROUPS.map((group, index) => (
          <th
            key={group.label}
            colSpan={group.colSpan}
            className={cn(
              'whitespace-nowrap border-b border-border/70 bg-muted/80 px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-foreground/70',
              index === 0 ? 'border-r-2 border-r-border/70' : 'border-r border-r-border/70',
            )}
          >
            {group.label}
          </th>
        ))}
      </GroupHeaderRow>

      <SubgroupHeaderRow>
        {FROZEN_SUBGROUPS.map((subgroup, index) => (
          <th
            key={`${subgroup.label}-${index}`}
            colSpan={subgroup.colSpan}
            className={cn(
              'whitespace-nowrap border-b border-border/70 bg-muted px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wider',
              index === 2 || index === 5 ? 'border-r-2 border-r-border/70' : 'border-r border-r-border/70',
            )}
          >
            {subgroup.label}
          </th>
        ))}
      </SubgroupHeaderRow>

      <ColumnHeaderRow>
        {FROZEN_COLS.map((col, index) => (
          <th
            key={col.key}
            className={cn(
              'whitespace-nowrap border-b border-border/70 bg-muted/50 px-1 py-1 text-right text-[10px] font-medium',
              index === 7 || index === 13
                ? 'border-r-2 border-r-border/70'
                : 'border-r border-r-border/70',
            )}
            style={{ width: col.w, minWidth: col.w }}
          >
            {col.label}
          </th>
        ))}
      </ColumnHeaderRow>
    </thead>
  )
}
