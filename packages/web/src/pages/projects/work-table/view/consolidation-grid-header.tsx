import type { ReactNode } from 'react'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { cn } from '@/lib/utils'
import { FROZEN_COLS, FROZEN_GROUPS, FROZEN_SUBGROUPS } from '@/lib/work-table/frozen'

function GroupHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-slate-100 text-slate-600">{children}</tr>
}

function SubgroupHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-slate-100 text-slate-500">{children}</tr>
}

function ColumnHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-slate-50 text-slate-500">{children}</tr>
}

export function ConsolidationGridHeader() {
  return (
    <thead>
      <GroupHeaderRow>
        <StickyColumnCell as="th" zIndex={30} shadowColor="#94a3b8" className="border-b border-slate-300 bg-slate-100 text-left font-semibold" rowSpan={3}>
          Task / Phase
        </StickyColumnCell>
        {FROZEN_GROUPS.map((group, index) => (
          <th
            key={group.label}
            colSpan={group.colSpan}
            className={cn(
              'whitespace-nowrap border-b border-slate-300 bg-slate-200 px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-slate-700',
              index === 0 ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-300',
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
              'whitespace-nowrap border-b border-slate-200 bg-slate-100 px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wider',
              index === 2 || index === 5 ? 'border-r-2 border-r-slate-400' : 'border-r-2 border-r-slate-300',
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
              'whitespace-nowrap border-b-2 border-slate-300 bg-slate-50 px-1 py-1 text-right text-[10px] font-medium',
              index === 7 || index === 13
                ? 'border-r-2 border-r-slate-400'
                : index === 3 || index === 6 || index === 10 || index === 12
                  ? 'border-r-2 border-r-slate-300'
                  : 'border-r border-r-slate-100',
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
