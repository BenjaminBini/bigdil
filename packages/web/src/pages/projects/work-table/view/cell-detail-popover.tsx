import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Lock, MessageSquare } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CompactInput } from '@/components/shared/compact-input'
import { StatusBadge } from '@/components/shared/status-badge'
import { useCellDetail, useUpsertCellEntry } from '@/api/hooks'
import { getPeriodDates, parsePeriodSliceKey } from '@/lib/period-utils'

const HOURS_PER_DAY = 8
const DOW_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// Build the Mon-Fri date list for the slice — mirrors the schedule grid
// logic so the popover reflects exactly the workdays the consultant sees.
function buildWeekdays(periodKey: string): { date: string; label: string }[] {
  const { weekCode, monthCode } = parsePeriodSliceKey(periodKey)
  const sliceCode = weekCode ?? monthCode
  const { startDate: weekStart, endDate: weekEnd } = getPeriodDates(sliceCode)
  const { startDate: monthStart, endDate: monthEnd } = getPeriodDates(monthCode)
  const start = weekCode && monthStart > weekStart ? monthStart : weekStart
  const end = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd
  const out: { date: string; label: string }[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const stop = new Date(`${end}T00:00:00Z`)
  while (cursor <= stop) {
    const dow = cursor.getUTCDay()
    if (dow >= 1 && dow <= 5) {
      const iso = cursor.toISOString().slice(0, 10)
      out.push({
        date: iso,
        label: `${DOW_FR[dow]} ${String(cursor.getUTCDate()).padStart(2, '0')}`,
      })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

interface CellDetailPopoverProps {
  projectId: string
  taskId: string
  profileId: string
  employeeId: string
  periodKey: string
  totalDays: number
  trigger: ReactNode
}

export function CellDetailPopover({
  projectId,
  taskId,
  profileId,
  employeeId,
  periodKey,
  totalDays,
  trigger,
}: CellDetailPopoverProps) {
  const [open, setOpen] = useState(false)
  const detail = useCellDetail({ taskId, profileId, employeeId, periodKey }, open)
  const upsert = useUpsertCellEntry(projectId)

  const weekdays = buildWeekdays(periodKey)
  const entriesByDate = new Map<string, { id: string; days: number; notes: string }>()
  for (const e of detail.data?.entries ?? []) {
    entriesByDate.set(e.workDate, { id: e.id, days: e.days, notes: e.notes })
  }

  const isEditable = !!detail.data?.editable

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="center">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Détail semaine</span>
            {detail.data?.bundleStatus && <StatusBadge status={detail.data.bundleStatus} />}
          </div>
          {!isEditable && <Lock size={12} className="text-muted-foreground" />}
        </div>

        {detail.isLoading ? (
          <div className="px-3 py-4 text-xs text-muted-foreground">Chargement…</div>
        ) : detail.isError ? (
          <div className="px-3 py-4 text-xs text-destructive">Échec du chargement</div>
        ) : (
          <div className="flex flex-col">
            {weekdays.map((day) => {
              const entry = entriesByDate.get(day.date)
              return (
                <DayRow
                  key={day.date}
                  label={day.label}
                  date={day.date}
                  hours={entry ? entry.days * HOURS_PER_DAY : 0}
                  notes={entry?.notes ?? ''}
                  editable={isEditable}
                  saving={upsert.isPending}
                  onSave={(hours) => {
                    if (!detail.data?.timesheetId) {
                      toast.error('Aucun bundle de timesheet pour cette semaine')
                      return
                    }
                    upsert.mutate(
                      {
                        timesheetId: detail.data.timesheetId,
                        assignmentSlotId: detail.data.slotId,
                        workDate: day.date,
                        days: hours / HOURS_PER_DAY,
                      },
                      {
                        onError: (err) =>
                          toast.error(err instanceof Error ? err.message : 'Échec de l\'enregistrement'),
                      },
                    )
                  }}
                />
              )
            })}
            <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-1.5 text-[11px] font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{totalDays}j</span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface DayRowProps {
  label: string
  date: string
  hours: number
  notes: string
  editable: boolean
  saving: boolean
  onSave: (hours: number) => void
}

function DayRow({ label, hours, notes, editable, saving, onSave }: DayRowProps) {
  const [val, setVal] = useState(String(Math.round(hours)))
  const [dirty, setDirty] = useState(false)

  function commit() {
    if (!dirty) return
    const parsed = parseFloat(val.replace(',', '.'))
    if (isNaN(parsed) || parsed < 0 || parsed > HOURS_PER_DAY) {
      setVal(String(Math.round(hours)))
      setDirty(false)
      return
    }
    onSave(parsed)
    setDirty(false)
  }

  if (!editable) {
    return (
      <div className="flex items-center justify-between px-3 py-1 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="flex items-center gap-1 tabular-nums">
          {notes && <MessageSquare size={10} className="text-muted-foreground/70" />}
          <span className={hours === 0 ? 'text-muted-foreground/40' : 'text-foreground'}>
            {hours === 0 ? '—' : `${Math.round(hours)}h`}
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <CompactInput
          type="text"
          inputMode="decimal"
          value={val}
          disabled={saving}
          onChange={(e) => { setVal(e.target.value); setDirty(true) }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur()
            if (e.key === 'Escape') { setVal(String(Math.round(hours))); setDirty(false) }
          }}
          className="w-12 text-right"
        />
        <span className="text-[10px] text-muted-foreground">h</span>
      </div>
    </div>
  )
}
