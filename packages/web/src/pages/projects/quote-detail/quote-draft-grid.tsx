import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { useAddQuoteLine, useUpdateQuoteLine, useDeleteQuoteLine, useCreateTask, useCreatePhase } from '@/api/hooks'
import type { Phase, Task, Profile, QuoteLine } from '@/api/types'
import { GridTable, StickyThead } from '@/components/shared/grid-table'
import { QuoteTh, QuoteGroupTh, QuoteTd } from '@/components/shared/quote-grid-cells'
import { CompactInput } from '@/components/shared/compact-input'
import { ColorValue } from '@/components/shared/color-value'
import { NullCell } from '@/components/shared/table-cells'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ── helpers ──────────────────────────────────────────────────────────────────

function sumLines(lines: QuoteLine[]) {
  const days = lines.reduce((s, l) => s + l.days, 0)
  const revenue = lines.reduce((s, l) => s + l.revenueAmount, 0)
  const cost = lines.reduce((s, l) => s + l.budgetCostAmount, 0)
  const margin = revenue - cost
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : null
  return { days, revenue, cost, margin, marginPct }
}

function sentiment(margin: number, pct: number | null) {
  if (margin < 0) return 'negative' as const
  if (pct !== null && pct >= 40) return 'positive' as const
  return 'neutral' as const
}

// ── cells ────────────────────────────────────────────────────────────────────

// ── aggregate rows ────────────────────────────────────────────────────────────

function PhaseRow({ phase, lines, colCount }: { phase: Phase; lines: QuoteLine[]; colCount: number }) {
  const { days, revenue, cost, margin, marginPct } = sumLines(lines)
  const s = sentiment(margin, marginPct)
  return (
    <tr className="group border-b border-border/70 bg-muted/60">
      <td className="whitespace-nowrap px-3 py-2">
        <span className="flex items-center gap-1 text-sm font-bold text-foreground">
          {phase.name}
        </span>
      </td>
      <QuoteTd className="font-semibold text-foreground">{days || '—'}</QuoteTd>
      <QuoteTd className="border-l border-border/50 text-muted-foreground"><NullCell /></QuoteTd>
      <QuoteTd className="border-r border-border/50 font-medium text-foreground">{revenue ? formatCurrency(revenue) : '—'}</QuoteTd>
      <QuoteTd className="text-muted-foreground"><NullCell /></QuoteTd>
      <QuoteTd className="border-r border-border/50 text-foreground/80">{cost ? formatCurrency(cost) : '—'}</QuoteTd>
      <QuoteTd bold>{margin ? <ColorValue value={margin} sentiment={s} format="currency" /> : '—'}</QuoteTd>
      <QuoteTd>{marginPct !== null && margin ? <ColorValue value={marginPct} sentiment={s} format="percent" /> : '—'}</QuoteTd>
      <td colSpan={colCount} />
    </tr>
  )
}

function TaskRow({ task, lines }: { task: Task; lines: QuoteLine[] }) {
  const { days, revenue, cost, margin, marginPct } = sumLines(lines)
  const s = sentiment(margin, marginPct)
  return (
    <tr className="border-b border-border/70 bg-card">
      <td className="whitespace-nowrap px-3 py-1.5">
        <div style={{ paddingLeft: 20 }} className="font-semibold text-sm text-foreground/80">{task.name}</div>
      </td>
      <QuoteTd className="font-semibold text-foreground/80">{days || '—'}</QuoteTd>
      <QuoteTd className="border-l border-border/50 text-muted-foreground"><NullCell /></QuoteTd>
      <QuoteTd className="border-r border-border/50 font-medium text-foreground/90">{revenue ? formatCurrency(revenue) : '—'}</QuoteTd>
      <QuoteTd className="text-muted-foreground"><NullCell /></QuoteTd>
      <QuoteTd className="border-r border-border/50 text-foreground/70">{cost ? formatCurrency(cost) : '—'}</QuoteTd>
      <QuoteTd bold>{margin ? <ColorValue value={margin} sentiment={s} format="currency" /> : '—'}</QuoteTd>
      <QuoteTd>{marginPct !== null && margin ? <ColorValue value={marginPct} sentiment={s} format="percent" /> : '—'}</QuoteTd>
      <td />
    </tr>
  )
}

// ── editable profile row ──────────────────────────────────────────────────────

interface ProfileRowProps {
  line: QuoteLine
  profileName: string
  projectId: string
  quoteId: string
}

function ProfileRow({ line, profileName, projectId, quoteId }: ProfileRowProps) {
  const updateLine = useUpdateQuoteLine(projectId, quoteId)
  const deleteLine = useDeleteQuoteLine(projectId, quoteId)

  const [localDays, setLocalDays] = useState(line.days)
  const [localSellRate, setLocalSellRate] = useState(line.sellRatePerDay)
  const [localCostRate, setLocalCostRate] = useState(line.costRateAssumptionPerDay)

  // Re-sync when a different line is rendered into this slot
  useEffect(() => {
    setLocalDays(line.days)
    setLocalSellRate(line.sellRatePerDay)
    setLocalCostRate(line.costRateAssumptionPerDay)
  }, [line.id])

  const revenue = localDays * localSellRate
  const cost = localDays * localCostRate
  const margin = revenue - cost
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : null
  const s = sentiment(margin, marginPct)

  function save(field: 'days' | 'sellRatePerDay' | 'costRateAssumptionPerDay', raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val) || val < 0) return
    updateLine.mutate({ lineId: line.id, [field]: val }, {
      onError: () => toast.error('Échec de la sauvegarde'),
    })
  }

  return (
    <tr className="group border-b border-border/70 bg-card hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
      <td className="whitespace-nowrap px-3 py-1.5">
        <div style={{ paddingLeft: 40 }} className="text-xs text-muted-foreground">{profileName}</div>
      </td>
      <QuoteTd className="cursor-text bg-sky-100/70 focus-within:bg-sky-200/80 dark:bg-sky-900/40 dark:focus-within:bg-sky-800/60" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
        <CompactInput
          key={`days-${line.id}`}
          type="number"
          defaultValue={line.days}
          min={0}
          step={0.5}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setLocalDays(v) }}
          onBlur={e => save('days', e.target.value)}
        />
      </QuoteTd>
      <QuoteTd className="cursor-text border-l border-border/50 bg-sky-100/70 focus-within:bg-sky-200/80 dark:bg-sky-900/40 dark:focus-within:bg-sky-800/60" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
        <CompactInput
          key={`sell-${line.id}`}
          type="number"
          defaultValue={line.sellRatePerDay}
          min={0}
          step={0.01}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setLocalSellRate(v) }}
          onBlur={e => save('sellRatePerDay', e.target.value)}
        />
      </QuoteTd>
      <QuoteTd className="border-r border-border/50 font-medium text-foreground/90 tabular-nums">
        {formatCurrency(revenue)}
      </QuoteTd>
      <QuoteTd className="cursor-text bg-sky-100/70 focus-within:bg-sky-200/80 dark:bg-sky-900/40 dark:focus-within:bg-sky-800/60" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
        <CompactInput
          key={`cost-${line.id}`}
          type="number"
          defaultValue={line.costRateAssumptionPerDay}
          min={0}
          step={0.01}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setLocalCostRate(v) }}
          onBlur={e => save('costRateAssumptionPerDay', e.target.value)}
        />
      </QuoteTd>
      <QuoteTd className="border-r border-border/50 text-foreground/70 tabular-nums">
        {formatCurrency(cost)}
      </QuoteTd>
      <QuoteTd bold>
        <ColorValue value={margin} sentiment={s} format="currency" />
      </QuoteTd>
      <QuoteTd>
        {marginPct !== null ? <ColorValue value={marginPct} sentiment={s} format="percent" /> : '—'}
      </QuoteTd>
      <td className="px-1 py-1">
        <button
          onClick={() => deleteLine.mutate(line.id, { onError: () => toast.error('Échec de la suppression') })}
          className="inline-flex items-center justify-center rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          title="Supprimer la ligne"
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  )
}

// ── add profile row ───────────────────────────────────────────────────────────

interface AddProfileRowProps {
  taskId: string
  profiles: Profile[]
  usedProfileIds: Set<string>
  projectId: string
  quoteId: string
}

function AddProfileRow({ taskId, profiles, usedProfileIds, projectId, quoteId }: AddProfileRowProps) {
  const [open, setOpen] = useState(false)
  const addLine = useAddQuoteLine(projectId, quoteId)

  const available = profiles.filter(p => !usedProfileIds.has(p.id))
  if (available.length === 0) return null

  function handleSelect(profile: Profile) {
    addLine.mutate({
      taskId,
      profileId: profile.id,
      days: 0,
      sellRatePerDay: profile.defaultSellRatePerDay,
      costRateAssumptionPerDay: profile.defaultCostRatePerDay,
    }, {
      onSuccess: () => setOpen(false),
      onError: () => toast.error('Échec de l\'ajout'),
    })
  }

  return (
    <tr className="border-b border-border/50 bg-card/50">
      <td className="px-3 py-1" colSpan={9}>
        <div style={{ paddingLeft: 40 }}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-border hover:text-foreground">
                <Plus size={11} /> Ajouter un profil
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="start">
              <div className="flex flex-col">
                {available.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-xs font-medium text-foreground">{p.name}</span>
                    <span className="ml-3 text-[11px] tabular-nums text-muted-foreground">
                      {formatCurrency(p.defaultSellRatePerDay)}/j
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </td>
    </tr>
  )
}

// ── grand total row ───────────────────────────────────────────────────────────

function GrandTotalRow({ lines }: { lines: QuoteLine[] }) {
  const { days, revenue, cost, margin, marginPct } = sumLines(lines)
  const s = sentiment(margin, marginPct)
  const avgSell = days > 0 ? revenue / days : null
  const avgCost = days > 0 ? cost / days : null

  return (
    <tr className="border-t-2 border-border bg-muted font-bold">
      <td className="whitespace-nowrap px-3 py-2 text-sm font-bold text-foreground">Total général</td>
      <QuoteTd className="font-bold text-foreground">{days}</QuoteTd>
      <QuoteTd className="border-l border-border/50 text-muted-foreground">
        {avgSell !== null ? <span><span className="mr-1 text-[10px] font-normal">moy</span>{formatCurrency(Math.round(avgSell))}</span> : '—'}
      </QuoteTd>
      <QuoteTd className="border-r border-border/50 font-bold text-foreground">{formatCurrency(revenue)}</QuoteTd>
      <QuoteTd className="text-muted-foreground">
        {avgCost !== null ? <span><span className="mr-1 text-[10px] font-normal">moy</span>{formatCurrency(Math.round(avgCost))}</span> : '—'}
      </QuoteTd>
      <QuoteTd className="border-r border-border/50 text-foreground/80">{formatCurrency(cost)}</QuoteTd>
      <QuoteTd bold><ColorValue value={margin} sentiment={s} format="currency" /></QuoteTd>
      <QuoteTd>{marginPct !== null ? <ColorValue value={marginPct} sentiment={s} format="percent" /> : '—'}</QuoteTd>
      <td />
    </tr>
  )
}

// ── add task / add phase inline rows ─────────────────────────────────────────

interface PhaseSectionProps {
  phase: Phase
  phaseTasks: Task[]
  linesByTask: Map<string, QuoteLine[]>
  profileMap: Map<string, Profile>
  projectId: string
  quoteId: string
  profiles: Profile[]
}

function PhaseSection({ phase, phaseTasks, linesByTask, profileMap, projectId, quoteId, profiles }: PhaseSectionProps) {
  const createTask = useCreateTask(projectId)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const phaseLines = phaseTasks.flatMap(t => linesByTask.get(t.id) ?? [])

  function commitAddTask() {
    const trimmed = newTaskName.trim()
    if (trimmed) {
      createTask.mutate({ phaseId: phase.id, name: trimmed }, {
        onSuccess: () => toast.success(`Tâche "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setNewTaskName('')
    setAddingTask(false)
  }

  return (
    <>
      <PhaseRow phase={phase} lines={phaseLines} colCount={1} />
      {phaseTasks.map(task => {
        const taskLines = linesByTask.get(task.id) ?? []
        const usedProfileIds = new Set(taskLines.map(l => l.profileId))
        return (
          <>
            <TaskRow key={task.id} task={task} lines={taskLines} />
            {taskLines.map(line => (
              <ProfileRow
                key={line.id}
                line={line}
                profileName={profileMap.get(line.profileId)?.name ?? line.profileId}
                projectId={projectId}
                quoteId={quoteId}
              />
            ))}
            <AddProfileRow
              key={`add-${task.id}`}
              taskId={task.id}
              profiles={profiles}
              usedProfileIds={usedProfileIds}
              projectId={projectId}
              quoteId={quoteId}
            />
          </>
        )
      })}
      {/* Always-visible add-task affordance at the bottom of each phase. */}
      <tr className="bg-card/60">
        <td className="whitespace-nowrap px-3 py-1" colSpan={9}>
          <div style={{ paddingLeft: 20 }}>
            {addingTask ? (
              <input
                ref={inputRef}
                autoFocus
                placeholder="Nom de la tâche…"
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onBlur={commitAddTask}
                onKeyDown={e => {
                  if (e.key === 'Enter') inputRef.current?.blur()
                  if (e.key === 'Escape') { setNewTaskName(''); setAddingTask(false) }
                }}
                className="w-40 rounded border border-sky-400 bg-background px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
              />
            ) : (
              <button
                onClick={() => setAddingTask(true)}
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <Plus size={11} /> Ajouter une tâche
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  )
}

function AddPhaseRow({ projectId }: { projectId: string }) {
  const createPhase = useCreatePhase(projectId)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = name.trim()
    if (trimmed) {
      createPhase.mutate({ name: trimmed }, {
        onSuccess: () => toast.success(`Phase "${trimmed}" créée`),
        onError: () => toast.error('Échec de la création'),
      })
    }
    setName('')
    setAdding(false)
  }

  return (
    <tr className="border-b border-border/50 bg-muted/20">
      <td className="px-3 py-1.5" colSpan={9}>
        {adding ? (
          <input
            ref={inputRef}
            autoFocus
            placeholder="Nom de la phase…"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') inputRef.current?.blur()
              if (e.key === 'Escape') { setName(''); setAdding(false) }
            }}
            className="w-44 rounded border border-sky-400 bg-background px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-sky-400"
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <Plus size={11} /> Ajouter une phase
          </button>
        )}
      </td>
    </tr>
  )
}

// ── header ────────────────────────────────────────────────────────────────────

function DraftGridHeader() {
  return (
    <StickyThead>
      <tr className="border-b border-border">
        <QuoteTh align="left" rowSpan={2}>Tâche / Profil</QuoteTh>
        <QuoteTh rowSpan={2}>Jours</QuoteTh>
        <QuoteGroupTh colSpan={2} color="blue" bordered="both">Chiffre d'affaires</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="orange" bordered="right">Coût</QuoteGroupTh>
        <QuoteGroupTh colSpan={2} color="muted">Marge</QuoteGroupTh>
        <th />
      </tr>
      <tr className="border-b border-border">
        <QuoteTh borderLeft>TJM vente</QuoteTh>
        <QuoteTh borderRight>Montant</QuoteTh>
        <QuoteTh>TJM coût</QuoteTh>
        <QuoteTh borderRight>Montant</QuoteTh>
        <QuoteTh>Montant</QuoteTh>
        <QuoteTh>%</QuoteTh>
        <th />
      </tr>
    </StickyThead>
  )
}

// ── main component ────────────────────────────────────────────────────────────

interface QuoteDraftGridProps {
  projectId: string
  quoteId: string
  phases: Phase[]
  profiles: Profile[]
  lines: QuoteLine[]
  frozenRateKeys?: Set<string>
}

export function QuoteDraftGrid({ projectId, quoteId, phases, profiles, lines }: QuoteDraftGridProps) {
  const linesByTask = new Map<string, QuoteLine[]>()
  for (const line of lines) {
    if (!linesByTask.has(line.taskId)) linesByTask.set(line.taskId, [])
    linesByTask.get(line.taskId)!.push(line)
  }

  // Always show the full WBS while a quote is in DRAFT — empty phases/tasks
  // give the editor a place to add lines without first jumping to the WBS tab.
  const visiblePhases = [...phases].sort((a, b) => a.sortOrder - b.sortOrder)

  function phaseTasksFor(phase: Phase): Task[] {
    return [...phase.tasks].sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const profileMap = new Map(profiles.map(p => [p.id, p]))

  return (
    <div className="flex flex-col gap-2">
      <GridTable className="w-full text-sm">
        <colgroup>
          <col className="min-w-[240px]" />
          <col className="w-20" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-20" />
          <col className="w-10" />
        </colgroup>

        <DraftGridHeader />

        <tbody>
          {visiblePhases.map(phase => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              phaseTasks={phaseTasksFor(phase)}
              linesByTask={linesByTask}
              profileMap={profileMap}
              projectId={projectId}
              quoteId={quoteId}
              profiles={profiles}
            />
          ))}
          <AddPhaseRow projectId={projectId} />
          <GrandTotalRow lines={lines} />
        </tbody>
      </GridTable>
    </div>
  )
}
