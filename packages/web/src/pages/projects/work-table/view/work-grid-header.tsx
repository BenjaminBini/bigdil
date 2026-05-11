import { useState, useRef, type ReactNode } from 'react'
import { Lock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { PeriodInfo } from '@/api/types'
import { StickyColumnCell } from '@/components/shared/sticky-column-cell'
import { formatShortDate } from '@/lib/format'
import { weekCodeForDate } from '@/lib/period-utils'
import { cn } from '@/lib/utils'
import { useCreatePhase } from '@/api/hooks'
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

function AddPhaseInline({ projectId }: { projectId: string }) {
  const { t } = useTranslation('pages')
  const createPhase = useCreatePhase(projectId)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = name.trim()
    if (trimmed) {
      createPhase.mutate({ name: trimmed }, {
        onSuccess: () => toast.success(t('workTable.phaseCreated', { name: trimmed })),
        onError: () => toast.error(t('workTable.createFailed')),
      })
    }
    setName('')
    setAdding(false)
  }

  if (adding) {
    return (
      <input
        ref={inputRef}
        autoFocus
        placeholder={t('workTable.phaseNamePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.blur()
          if (e.key === 'Escape') { setName(''); setAdding(false) }
        }}
        className="w-32 rounded border border-sky-400 bg-background px-1.5 py-0.5 text-xs font-normal text-foreground outline-none focus:ring-1 focus:ring-sky-400"
      />
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="ml-2 inline-flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
      title={t('workTable.addPhaseTitle')}
    >
      <Plus size={14} />
    </button>
  )
}

function SummaryHeaderCell({ label, tooltip, index }: { label: string; tooltip: string; index: number }) {
  return (
    <th
      rowSpan={2}
      title={tooltip}
      className="border-b border-r border-border/70 bg-muted px-1 py-2 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
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
  projectId: string
  periods: PeriodInfo[]
}

export function WorkGridHeader({ projectId, periods }: WorkGridHeaderProps) {
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
          className="border-b border-border bg-muted text-left font-semibold"
        >
          <span className="flex items-center">
            {t('workTable.taskPhaseColumn', 'Task / Phase')}
            <AddPhaseInline projectId={projectId} />
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
