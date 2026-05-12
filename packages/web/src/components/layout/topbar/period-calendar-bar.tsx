import { useMemo } from 'react'
import { useTimesheetWindow } from '@/api/hooks'
import { getIntlLocale } from '@/lib/i18n'
import { deriveTimesheetWindowStatus, getPeriodDates, getPeriodSlicesForDateRange, parsePeriodSliceKey } from '@/lib/period-utils'
import { cn } from '@/lib/utils'

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function weekNumberLabel(weekCode: string): string {
  const match = weekCode.match(/W(\d{1,2})$/)
  return match ? `W${match[1]}` : weekCode
}

function formatMonthShort(monthCode: string): string {
  const { startDate } = getPeriodDates(monthCode)
  return new Intl.DateTimeFormat(getIntlLocale(), { month: 'short' }).format(new Date(`${startDate}T00:00:00Z`))
}

function formatDayRange(startDate: string, endDate: string): string {
  const locale = getIntlLocale()
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit' })
  return `${dayFormatter.format(new Date(startDate))} - ${dayFormatter.format(new Date(endDate))}`
}

export function PeriodCalendarBar() {
  const { data: window, isLoading } = useTimesheetWindow()

  const periodSlices = useMemo(() => {
    if (!window) return []
    const { weekCode } = parsePeriodSliceKey(window.openPeriodKey)
    if (!weekCode) return []
    const openWeekDates = getPeriodDates(weekCode)
    const startDate = shiftDate(openWeekDates.startDate, -28)
    const endDate = shiftDate(openWeekDates.endDate, 28)
    return getPeriodSlicesForDateRange(startDate, endDate, 'WEEKLY').map((slice) => ({
      ...slice,
      status: deriveTimesheetWindowStatus(slice.periodKey, window.openPeriodKey),
    }))
  }, [window])

  if (isLoading) {
    return (
      <div className="flex h-11 items-stretch border-b border-border bg-card">
        <div className="h-full w-full animate-pulse bg-muted/40" />
      </div>
    )
  }

  if (!window) return null

  return (
    <div className="border-b border-border bg-card">
      <div className="flex h-8 items-stretch overflow-x-auto">
        {periodSlices.map((slice, index) => {
          const prev = periodSlices[index - 1]
          const monthChanged = prev && prev.monthCode !== slice.monthCode

          return (
            <div key={slice.periodKey} className="flex items-stretch">
              {monthChanged && (
                <div className="flex w-8 shrink-0 items-center justify-center border-x border-border bg-muted/60 text-[8px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="whitespace-nowrap">{formatMonthShort(slice.monthCode)}</span>
                </div>
              )}
              <div
                className={cn(
                  'flex min-w-[118px] items-center gap-1 border-r border-border px-2 text-left text-[10px] transition-colors',
                  slice.status === 'OPEN' && 'bg-primary/15 text-primary shadow-[inset_0_-1px_0_0_var(--primary)]',
                  slice.status === 'CONSOLIDATION' && 'bg-muted/60 text-muted-foreground shadow-[inset_0_-1px_0_0_var(--border)]',
                  slice.status === 'FROZEN' && 'text-muted-foreground/90',
                  slice.status === 'FUTURE' && 'text-muted-foreground/70',
                )}
              >
                <div className="flex min-w-0 items-center gap-1">
                  <span className={cn(
                    'font-semibold tabular-nums',
                    slice.status === 'OPEN' && 'text-primary',
                    slice.status === 'CONSOLIDATION' && 'text-foreground',
                    slice.status === 'FROZEN' && 'text-foreground/85',
                    slice.status === 'FUTURE' && 'text-muted-foreground',
                  )}>
                    {weekNumberLabel(slice.weekCode ?? '')}
                  </span>
                </div>
                <div className={cn(
                  'shrink-0 whitespace-nowrap text-[9px]',
                  slice.status === 'OPEN' && 'text-primary/80',
                  slice.status === 'CONSOLIDATION' && 'text-muted-foreground',
                  slice.status === 'FROZEN' && 'text-muted-foreground',
                  slice.status === 'FUTURE' && 'text-muted-foreground/75',
                )}>
                  {formatDayRange(slice.startDate, slice.endDate)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
