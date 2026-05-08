import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useAddQuoteLine, useUpdateQuoteLine, useDeleteQuoteLine } from '@/api/hooks'
import type { Task, Profile, QuoteLine } from '@/api/types'
import { GridTable, StickyThead } from '@/components/shared/grid-table'
import { QuoteTh, QuoteGroupTh, QuoteTd } from '@/components/shared/quote-grid-cells'
import { TreeRowLabel } from '@/components/shared/tree-row-label'
import { CompactInput } from '@/components/shared/compact-input'
import { ColorValue } from '@/components/shared/color-value'
import { NullCell } from '@/components/shared/table-cells'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

function LabelTd({ children, depth, className }: { children: React.ReactNode; depth: number; className?: string }) {
  return (
    <td className={cn('whitespace-nowrap px-3 py-2', className)}>
      <TreeRowLabel label="" depth={depth} indentPx={20} className="hidden" />
      <div style={{ paddingLeft: depth * 20 }}>{children}</div>
    </td>
  )
}

function AggregateTd({ label, className }: { label: string; className?: string }) {
  return <td className={cn('whitespace-nowrap px-3 py-2', className)}>{label}</td>
}

// ── aggregate rows ────────────────────────────────────────────────────────────

function PhaseRow({ phase, lines, colCount }: { phase: Task; lines: QuoteLine[]; colCount: number }) {
  const { days, revenue, cost, margin, marginPct } = sumLines(lines)
  const s = sentiment(margin, marginPct)
  return (
    <tr className="border-b border-border/70 bg-muted/60">
      <AggregateTd label={phase.name} className="text-sm font-bold text-foreground" />
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

  const revenue = line.days * line.sellRatePerDay
  const cost = line.days * line.costRateAssumptionPerDay
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
      <QuoteTd className="bg-sky-50/40 dark:bg-sky-950/20">
        <CompactInput
          key={`days-${line.id}`}
          type="number"
          defaultValue={line.days}
          min={0}
          step={0.5}
          onBlur={e => save('days', e.target.value)}
        />
      </QuoteTd>
      <QuoteTd className="border-l border-border/50 bg-sky-50/40 dark:bg-sky-950/20">
        <CompactInput
          key={`sell-${line.id}`}
          type="number"
          defaultValue={line.sellRatePerDay}
          min={0}
          step={0.01}
          onBlur={e => save('sellRatePerDay', e.target.value)}
        />
      </QuoteTd>
      <QuoteTd className="border-r border-border/50 font-medium text-foreground/90 tabular-nums">
        {formatCurrency(revenue)}
      </QuoteTd>
      <QuoteTd className="bg-sky-50/40 dark:bg-sky-950/20">
        <CompactInput
          key={`cost-${line.id}`}
          type="number"
          defaultValue={line.costRateAssumptionPerDay}
          min={0}
          step={0.01}
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

  function handleSelect(profileId: string) {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) return
    addLine.mutate({
      taskId,
      profileId,
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
          {open ? (
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="h-7 w-44 text-xs">
                <SelectValue placeholder="Choisir un profil…" />
              </SelectTrigger>
              <SelectContent>
                {available.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            >
              <Plus size={11} /> Ajouter un profil
            </button>
          )}
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
  flatTasks: Task[]
  profiles: Profile[]
  lines: QuoteLine[]
}

export function QuoteDraftGrid({ projectId, quoteId, flatTasks, profiles, lines }: QuoteDraftGridProps) {
  const phases = flatTasks.filter(t => !t.parentTaskId)

  const linesByTask = new Map<string, QuoteLine[]>()
  for (const line of lines) {
    if (!linesByTask.has(line.taskId)) linesByTask.set(line.taskId, [])
    linesByTask.get(line.taskId)!.push(line)
  }

  const profileMap = new Map(profiles.map(p => [p.id, p]))

  return (
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
        {phases.map(phase => {
          const phaseTasks = flatTasks.filter(t => t.parentTaskId === phase.id)
          const phaseLines = phaseTasks.flatMap(t => linesByTask.get(t.id) ?? [])

          return (
            <>
              <PhaseRow key={phase.id} phase={phase} lines={phaseLines} colCount={1} />
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
            </>
          )
        })}
        <GrandTotalRow lines={lines} />
      </tbody>
    </GridTable>
  )
}
