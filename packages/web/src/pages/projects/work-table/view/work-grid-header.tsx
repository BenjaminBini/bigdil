import { type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PeriodInfo } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatShortDate } from '@/lib/format'
import { weekCodeForDate } from '@/lib/period-utils'
import { cn } from '@/lib/utils'
import { stickySummaryStyle } from '@/lib/work-table/display'

function HeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-muted text-muted-foreground">{children}</tr>
}

function PeriodNumberLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold">{children}</span>
}

function PeriodDateLabel({ children }: { children: ReactNode }) {
  return <span className="text-[10px] font-normal opacity-70">{children}</span>
}

function PeriodWeekLabel({ period }: { period: PeriodInfo }) {
  const weekCode = period.weekCode ?? weekCodeForDate(period.startDate)
  const weekNumber = weekCode.match(/W(\d{1,2})$/)?.[1]
  return weekNumber ? `W${weekNumber}` : 'W'
}

function getMonthGroups(periods: PeriodInfo[]) {
  const groups: Array<{ monthCode: string; label: string; colSpan: number }> = []
  for (const period of periods) {
    const last = groups[groups.length - 1]
    if (last && last.monthCode === period.monthCode) {
      last.colSpan += 1
    } else {
      groups.push({ monthCode: period.monthCode, label: period.groupLabel, colSpan: 1 })
    }
  }
  return groups
}

function SummaryHeaderCell({ label, tooltip, index }: { label: string; tooltip: string; index: number }) {
  return (
    <th
      rowSpan={2}
      title={tooltip}
      className="border-b border-row-divider bg-muted px-1 py-2 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
      style={stickySummaryStyle(index)}
    >
      <span
        className="inline-block whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {label}
      </span>
    </th>
  )
}

interface WorkGridHeaderProps {
  periods: PeriodInfo[]
}

export function WorkGridHeader({ periods }: WorkGridHeaderProps) {
  const { t } = useTranslation('pages')
  const monthGroups = getMonthGroups(periods)
  return (
    <thead>
      <HeaderRow>
        <StickyColumnCell
          rowSpan={2}
          as="th"
          zIndex={30}
          noShadow
          className="border-b border-row-divider bg-muted text-left font-semibold"
        >
          <span className="flex items-center">
            {t('workTable.taskPhaseColumn', 'Task / Phase')}
          </span>
        </StickyColumnCell>

        <SummaryHeaderCell
          index={0}
          label={t('workTable.summary.validatedDaysSpent')}
          tooltip={t('workTable.summary.validatedDaysSpentTooltip')}
        />
        <SummaryHeaderCell
          index={1}
          label={t('workTable.summary.daysInConsolidation')}
          tooltip={t('workTable.summary.daysInConsolidationTooltip')}
        />
        <SummaryHeaderCell
          index={2}
          label={t('workTable.summary.totalRemaining')}
          tooltip={t('workTable.summary.totalRemainingTooltip')}
        />
        <SummaryHeaderCell
          index={3}
          label={t('workTable.summary.toPlan')}
          tooltip={t('workTable.summary.toPlanTooltip')}
        />

        {monthGroups.map((group) => (
          <th
            key={group.monthCode}
            colSpan={group.colSpan}
            className="border-b border-r border-border/70 bg-muted px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {group.label}
          </th>
        ))}
      </HeaderRow>

      <HeaderRow>
        {periods.map((period) => {
          const isFrozen = period.status === 'FROZEN'
          const isConsolidation = period.status === 'CONSOLIDATION'
          const isOpen = period.status === 'OPEN'

          return (
            <th
              key={period.periodKey}
              className={cn(
                'min-w-[56px] w-14 whitespace-nowrap border-b border-r border-border/70 px-1 py-1 text-center',
                isFrozen && 'bg-muted text-muted-foreground',
                isConsolidation &&
                  'bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                isOpen &&
                  'bg-sky-100 font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
                !isFrozen &&
                  !isConsolidation &&
                  !isOpen &&
                  'bg-muted text-muted-foreground',
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <PeriodNumberLabel>
                  <PeriodWeekLabel period={period} />
                  {(isFrozen || isConsolidation) && (
                    <Lock className="ml-0.5 inline-block size-2.5 opacity-60" />
                  )}
                </PeriodNumberLabel>
                <PeriodDateLabel>{formatShortDate(period.startDate)}</PeriodDateLabel>
              </div>
            </th>
          )
        })}
      </HeaderRow>
    </thead>
  )
}
