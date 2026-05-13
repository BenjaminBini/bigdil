import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Check, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { LoadingState, ErrorState } from '@/components/shared/page-container'
import { VStack } from '@/components/shared/VStack'
import { useQuoteAllocations, useSaveQuoteLineAllocations } from '@/api/hooks'
import type { Employee, QuoteAllocationLine } from '@/api/types'
import { formatDays } from '@/lib/format'
import { cn } from '@/lib/utils'

interface QuoteInitialAllocationProps {
  projectId: string
  quoteId: string
  taskNameOf: (taskId: string) => string
  profileNameOf: (profileId: string) => string
  employees: Employee[]
}

interface DraftEntry {
  /** Local-only id so we can key on it before save. */
  key: string
  employeeId: string
  days: string
}

function makeKey(): string {
  return `tmp-${Math.random().toString(36).slice(2)}`
}

function entriesFromLine(line: QuoteAllocationLine): DraftEntry[] {
  if (line.allocations.length === 0) {
    return [{ key: makeKey(), employeeId: '', days: '' }]
  }
  return line.allocations.map((a) => ({
    key: a.id,
    employeeId: a.employeeId,
    days: String(a.days),
  }))
}

function parseDays(input: string): number | null {
  const trimmed = input.trim().replace(',', '.')
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

interface AllocationLineEditorProps {
  line: QuoteAllocationLine
  projectId: string
  quoteId: string
  taskName: string
  profileName: string
  employees: Employee[]
}

function AllocationLineEditor({
  line,
  projectId,
  quoteId,
  taskName,
  profileName,
  employees,
}: AllocationLineEditorProps) {
  const { t } = useTranslation('pages')
  const [draft, setDraft] = useState<DraftEntry[]>(() => entriesFromLine(line))
  const saveLine = useSaveQuoteLineAllocations(projectId, quoteId)

  // Re-sync when the server data changes (e.g., after another tab edits, or
  // after save invalidation). Reset draft to the latest server allocations.
  useEffect(() => {
    setDraft(entriesFromLine(line))
  }, [line])

  const isLocked = line.lockedBy != null

  const totalDays = draft.reduce((sum, e) => sum + (parseDays(e.days) ?? 0), 0)
  const balanced = Math.abs(totalDays - line.quotedDays) <= 0.01
  const hasEmptyEmployee = draft.some((e) => e.employeeId === '')
  const hasInvalidDays = draft.some((e) => {
    const v = parseDays(e.days)
    return v === null || v <= 0
  })
  const hasDuplicate =
    new Set(draft.filter((e) => e.employeeId).map((e) => e.employeeId)).size !==
    draft.filter((e) => e.employeeId).length
  const canSave = !isLocked && balanced && !hasEmptyEmployee && !hasInvalidDays && !hasDuplicate

  function updateEntry(idx: number, patch: Partial<DraftEntry>) {
    setDraft((prev) => prev.map((entry, i) => (i === idx ? { ...entry, ...patch } : entry)))
  }
  function addEntry() {
    setDraft((prev) => [...prev, { key: makeKey(), employeeId: '', days: '' }])
  }
  function removeEntry(idx: number) {
    setDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSave() {
    saveLine.mutate(
      {
        lineId: line.lineId,
        allocations: draft.map((e) => ({
          employeeId: e.employeeId,
          days: parseDays(e.days) ?? 0,
        })),
      },
      {
        onSuccess: () => toast.success(t('quoteAllocation.toasts.saved')),
        onError: (err: Error) =>
          toast.error(t('quoteAllocation.toasts.saveFailed'), { description: err.message }),
      },
    )
  }

  return (
    <Card variant="compact" className="px-4">
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{taskName}</div>
          <div className="text-xs text-muted-foreground">
            {profileName} · {t('quoteAllocation.quoted', { days: formatDays(line.quotedDays) })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {isLocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
              <Lock size={12} />
              {t('quoteAllocation.lockedShort')}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono tabular-nums',
              balanced
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            )}
          >
            {balanced ? <Check size={12} /> : <AlertCircle size={12} />}
            {formatDays(totalDays)} / {formatDays(line.quotedDays)} j
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {draft.map((entry, idx) => (
          <div key={entry.key} className="flex items-center gap-2">
            <Select
              value={entry.employeeId}
              onValueChange={(val) => updateEntry(idx, { employeeId: val })}
              disabled={isLocked}
            >
              <SelectTrigger className="h-8 w-64 text-xs">
                <SelectValue placeholder={t('quoteAllocation.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={entry.days}
              onChange={(e) => updateEntry(idx, { days: e.target.value })}
              disabled={isLocked}
              inputMode="decimal"
              placeholder="0"
              className="h-8 w-20 text-right text-xs tabular-nums"
            />
            <span className="text-xs text-muted-foreground">j</span>
            {!isLocked && draft.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(idx)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        {!isLocked ? (
          <Button type="button" variant="ghost" size="sm" onClick={addEntry} className="h-7 px-2 text-xs">
            <Plus size={12} />
            {t('quoteAllocation.addEmployee')}
          </Button>
        ) : (
          <MutedText className="text-xs">{t('quoteAllocation.locked', { snapshotId: line.lockedBy })}</MutedText>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!canSave || saveLine.isPending}
          className="h-8"
        >
          {saveLine.isPending ? t('quoteAllocation.saving') : t('quoteAllocation.save')}
        </Button>
      </div>
    </Card>
  )
}

export function QuoteInitialAllocation({
  projectId,
  quoteId,
  taskNameOf,
  profileNameOf,
  employees,
}: QuoteInitialAllocationProps) {
  const { t } = useTranslation('pages')
  const { data, isLoading, error } = useQuoteAllocations(projectId, quoteId)

  const activeEmployees = useMemo(() => employees.filter((e) => e.active), [employees])

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={t('quoteAllocation.errorLoading')} variant="muted" />

  return (
    <VStack gap="md">
      <div>
        <SectionTitle>{t('quoteAllocation.title')}</SectionTitle>
        <MutedText spacing="tight">{t('quoteAllocation.subtitle')}</MutedText>
      </div>
      {data.lines.map((line) => (
        <AllocationLineEditor
          key={line.lineId}
          line={line}
          projectId={projectId}
          quoteId={quoteId}
          taskName={taskNameOf(line.taskId)}
          profileName={profileNameOf(line.profileId)}
          employees={activeEmployees}
        />
      ))}
    </VStack>
  )
}
