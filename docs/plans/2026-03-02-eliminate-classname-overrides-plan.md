# Eliminate className Overrides — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all className overrides and raw HTML/CSS from business components by building a three-layer UI architecture: primitives → adapters → business components.

**Architecture:** Expand UI primitives with CVA variants (Button, Input, Card), then build domain-agnostic adapter components (SuccessButton, CompactInput, ColorValue, Legend, IconBox) that hide styling details. Business components consume adapters and never touch className.

**Tech Stack:** React 19, CVA (class-variance-authority), Tailwind CSS, shadcn/ui primitives, Lucide icons.

**Design doc:** `docs/plans/2026-03-02-eliminate-classname-overrides-design.md`

---

## Task 1: Button — add success, warning, success-outline, destructive-outline variants

**Files:**
- Modify: `packages/web/src/components/ui/button.tsx`

**Step 1: Add the new variants to the CVA definition**

In the `variant` section of `buttonVariants`, add after the `link` variant:

```tsx
success:
  "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/20",
warning:
  "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600/20",
"success-outline":
  "border border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950",
"destructive-outline":
  "border border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950",
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add packages/web/src/components/ui/button.tsx
git commit -m "feat(ui): add success, warning, success-outline, destructive-outline Button variants"
```

---

## Task 2: Input — add size variant system with CVA

**Files:**
- Modify: `packages/web/src/components/ui/input.tsx`

**Step 1: Add CVA with size variants**

Replace the current plain `className` approach with a CVA system:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-9 px-3 py-1 text-base md:text-sm",
        sm: "h-7 px-1.5 py-0.5 text-xs tabular-nums",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)
```

Update the Input component to accept and apply the `size` prop:

```tsx
function Input({
  className,
  type,
  size = "default",
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  )
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no errors (existing usages pass no `size`, which defaults to `"default"`)

**Step 3: Commit**

```bash
git add packages/web/src/components/ui/input.tsx
git commit -m "feat(ui): add size variant system to Input (default, sm)"
```

---

## Task 3: Card — add variant system (default, muted, flush)

**Files:**
- Modify: `packages/web/src/components/ui/card.tsx`

**Step 1: Add CVA to the Card component**

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "flex flex-col rounded-xl border shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground gap-6 py-6",
        muted: "bg-gray-50 text-card-foreground gap-6 py-6",
        flush: "bg-card text-card-foreground overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

Update the Card function to accept variant:

```tsx
function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add packages/web/src/components/ui/card.tsx
git commit -m "feat(ui): add variant system to Card (default, muted, flush)"
```

---

## Task 4: Button adapters — SuccessButton, WarningButton, DangerButton, ApproveButton, RejectButton

**Files:**
- Create: `packages/web/src/components/shared/button-adapters.tsx`

**Step 1: Create the adapter file**

```tsx
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type ButtonProps = ComponentProps<typeof Button>

/** Green filled button for confirmations and approvals. */
export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />
}

/** Amber filled button for proceeding-with-caution actions. */
export function WarningButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="warning" {...props} />
}

/** Red filled button for dangerous/irreversible actions. */
export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="destructive" {...props} />
}

/** Small outlined green button — typically used inline in tables for approve actions. */
export function ApproveButton(props: Omit<ButtonProps, 'variant' | 'size'>) {
  return <Button variant="success-outline" size="sm" {...props} />
}

/** Small outlined red button — typically used inline in tables for reject actions. */
export function RejectButton(props: Omit<ButtonProps, 'variant' | 'size'>) {
  return <Button variant="destructive-outline" size="sm" {...props} />
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/components/shared/button-adapters.tsx
git commit -m "feat(shared): add SuccessButton, WarningButton, DangerButton, ApproveButton, RejectButton adapters"
```

---

## Task 5: CompactInput adapter

**Files:**
- Create: `packages/web/src/components/shared/compact-input.tsx`

**Step 1: Create the adapter**

```tsx
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InputProps = ComponentProps<typeof Input>

/** Small centered numeric input for table cells. */
export function CompactInput({ className, ...props }: Omit<InputProps, 'size'>) {
  return <Input size="sm" className={cn('w-14 text-center', className)} {...props} />
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/components/shared/compact-input.tsx
git commit -m "feat(shared): add CompactInput adapter for table cell inputs"
```

---

## Task 6: ColorValue adapter — semantic number coloring

**Files:**
- Create: `packages/web/src/components/shared/color-value.tsx`

**Step 1: Create the component**

```tsx
import { cn } from '@/lib/utils'
import { formatCurrency, formatDays } from '@/lib/format'

type Sentiment = 'auto' | 'positive' | 'negative' | 'neutral' | 'warning'
type Format = 'currency' | 'percent' | 'days' | 'number' | 'raw'

export interface ColorValueProps {
  value: number | string
  sentiment?: Sentiment
  format?: Format
  className?: string
}

const SENTIMENT_COLORS: Record<Exclude<Sentiment, 'auto'>, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral: 'text-muted-foreground',
  warning: 'text-amber-600',
}

function resolveSentiment(sentiment: Sentiment, value: number | string): Exclude<Sentiment, 'auto'> {
  if (sentiment !== 'auto') return sentiment
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'positive' : 'negative'
}

function formatValue(value: number | string, format: Format): string {
  if (format === 'raw') return String(value)
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return String(value)
  switch (format) {
    case 'currency': return formatCurrency(num)
    case 'percent': return `${num.toFixed(1)}%`
    case 'days': return `${num % 1 === 0 ? num : num.toFixed(2)}d`
    case 'number': return num.toLocaleString('fr-FR')
  }
}

export function ColorValue({
  value,
  sentiment = 'auto',
  format = 'raw',
  className,
}: ColorValueProps) {
  const resolved = resolveSentiment(sentiment, value)
  return (
    <span className={cn('font-semibold tabular-nums', SENTIMENT_COLORS[resolved], className)}>
      {formatValue(value, format)}
    </span>
  )
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/components/shared/color-value.tsx
git commit -m "feat(shared): add ColorValue adapter for semantic number coloring"
```

---

## Task 7: Legend adapter

**Files:**
- Create: `packages/web/src/components/shared/legend.tsx`

**Step 1: Create the component**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface LegendItem {
  icon?: ReactNode
  /** Colored swatch shown when no icon. Uses Tailwind bg class like "bg-amber-100". */
  swatch?: string
  /** Border color for the swatch. Uses Tailwind border class like "border-amber-200". */
  swatchBorder?: string
  label: string
}

export interface LegendProps {
  items: LegendItem[]
  className?: string
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.icon ? (
            <span className="inline-flex size-3 items-center justify-center rounded-sm border border-slate-200 bg-slate-100">
              {item.icon}
            </span>
          ) : item.swatch ? (
            <span className={cn('inline-block size-3 rounded-sm border', item.swatch, item.swatchBorder)} />
          ) : null}
          {item.label}
        </span>
      ))}
    </div>
  )
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/components/shared/legend.tsx
git commit -m "feat(shared): add Legend adapter for chart/table legends"
```

---

## Task 8: IconBox adapter

**Files:**
- Create: `packages/web/src/components/shared/icon-box.tsx`

**Step 1: Create the component**

```tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconBoxProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  variant?: 'muted' | 'primary' | 'accent'
  className?: string
}

const SIZE_CLASSES = {
  sm: { box: 'size-8 rounded-lg', icon: 'size-4' },
  md: { box: 'size-11 rounded-xl', icon: 'size-5' },
  lg: { box: 'size-14 rounded-2xl', icon: 'size-6' },
}

const VARIANT_CLASSES = {
  muted: 'bg-gray-100 text-gray-600',
  primary: 'bg-primary text-primary-foreground shadow-sm',
  accent: 'bg-blue-100 text-blue-600',
}

export function IconBox({ icon: Icon, size = 'md', variant = 'muted', className }: IconBoxProps) {
  const s = SIZE_CLASSES[size]
  return (
    <div className={cn('flex items-center justify-center', s.box, VARIANT_CLASSES[variant], className)}>
      <Icon className={s.icon} />
    </div>
  )
}
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/components/shared/icon-box.tsx
git commit -m "feat(shared): add IconBox adapter for icon containers"
```

---

## Task 9: Refactor approvals-table.tsx — replace all className overrides

**Files:**
- Modify: `packages/web/src/pages/timesheets/approvals/approvals-table.tsx`

**Step 1: Replace Button className overrides with adapters**

Replace imports and usages:
- `<Button className="bg-green-600 ...">Approve All</Button>` → `<SuccessButton size="sm" ...>Approve All</SuccessButton>`
- `<Button variant="outline" className="h-7 border-green-300 ...">Approve</Button>` → `<ApproveButton ...>Approve</ApproveButton>`
- `<Button variant="outline" className="h-7 border-red-300 ...">Reject</Button>` → `<RejectButton ...>Reject</RejectButton>`

Replace the `deltaColor` function with `<ColorValue>`:
- `<TableCell className={...deltaColor(delta)...}>{formatDelta(delta)}</TableCell>` → use ColorValue with a custom format

Replace `<Badge className={timesheetStatusColors[row.status]}>` with `<StatusBadge status={row.status}>` (already exists in shared).

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/pages/timesheets/approvals/approvals-table.tsx
git commit -m "refactor(approvals): replace className overrides with button adapters and ColorValue"
```

---

## Task 10: Refactor period-close steps — step1, step2, step3, step4

**Files:**
- Modify: `packages/web/src/pages/projects/period-close/step1-checklist.tsx`
- Modify: `packages/web/src/pages/projects/period-close/step2-reforecast.tsx`
- Modify: `packages/web/src/pages/projects/period-close/step3-preview.tsx`
- Modify: `packages/web/src/pages/projects/period-close/step4-confirm.tsx`
- Modify: `packages/web/src/pages/projects/period-close/step1-plan-actual-table.tsx`

**Step 1: step1-checklist.tsx**

- `<Button className={cn(allApproved ? 'bg-gray-900 ...' : 'bg-amber-600 ...')}>` → conditional: `allApproved ? <Button>Next</Button> : <WarningButton>Next (bypass warning)</WarningButton>`

**Step 2: step2-reforecast.tsx**

- `<Input className="h-7 w-14 text-center text-xs px-1 tabular-nums">` → `<CompactInput>`
- `<Button className="bg-gray-900 hover:bg-gray-800">` → `<Button>` (default variant is dark primary)
- Variance `<span className={cn(...ternary...)}>` → `<ColorValue value={variance} format="days" />`

**Step 3: step3-preview.tsx**

- `<Button className="bg-gray-900 hover:bg-gray-800">` → `<Button>` (default variant)

**Step 4: step4-confirm.tsx**

- `<Button className="bg-orange-600 hover:bg-orange-700 text-white">` → `<WarningButton>` or `<DangerButton>` (closing a period is a serious action)

**Step 5: step1-plan-actual-table.tsx**

- Replace `statusBadgeColor(row.status)` + `<Badge className={...}>` → `<StatusBadge status={row.status}>`
- Replace delta color ternary → `<ColorValue>`

**Step 6: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 7: Commit**

```bash
git add packages/web/src/pages/projects/period-close/
git commit -m "refactor(period-close): replace className overrides with adapters (ColorValue, CompactInput, button adapters)"
```

---

## Task 11: Refactor work-table views — header, summary-bar, margin-insight, planning zones

**Files:**
- Modify: `packages/web/src/pages/projects/work-table/view/work-table-header.tsx`
- Modify: `packages/web/src/pages/projects/work-table/view/summary-bar.tsx`
- Modify: `packages/web/src/pages/projects/work-table/view/margin-insight-panel.tsx`
- Modify: `packages/web/src/pages/projects/work-table/view/planning-total-zone.tsx`
- Modify: `packages/web/src/pages/projects/work-table/view/planning-period-zone.tsx`

**Step 1: work-table-header.tsx**

Replace the manual legend rendering (lines 18-37) with `<Legend>`:

```tsx
<Legend items={[
  { icon: <Lock className="size-2 text-slate-400" />, label: 'Frozen' },
  { swatch: 'bg-amber-100', swatchBorder: 'border-amber-200', label: 'Consolidation' },
  { swatch: 'bg-sky-100', swatchBorder: 'border-sky-200', label: 'Open' },
  { swatch: 'bg-white', swatchBorder: 'border-slate-200', label: 'Future' },
]} />
```

**Step 2: summary-bar.tsx**

Replace all inline `<span className={cn('font-mono ...', ternary)}>` patterns with `<ColorValue>`.

**Step 3: margin-insight-panel.tsx**

Replace the inline conditional card styling with a proper component approach — use Card variant="flush" and move conditional border colors into a small local helper or a `sentiment` prop approach. Replace metric value spans with ColorValue.

**Step 4: planning-total-zone.tsx and planning-period-zone.tsx**

Replace margin value `<span className={cn(..., margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>` → `<ColorValue value={margin} format="currency" />`.

**Step 5: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 6: Commit**

```bash
git add packages/web/src/pages/projects/work-table/view/
git commit -m "refactor(work-table): replace raw HTML legend and className overrides with Legend, ColorValue adapters"
```

---

## Task 12: Refactor snapshot-detail tabs — scope-tab, actuals-tab

**Files:**
- Modify: `packages/web/src/pages/projects/snapshot-detail/scope-tab.tsx`
- Modify: `packages/web/src/pages/projects/snapshot-detail/actuals-tab.tsx`

**Step 1: scope-tab.tsx**

Replace the raw div summary cards (lines 67-86) with `<KpiCard>` components:

```tsx
<div className="flex flex-wrap gap-4">
  <KpiCard label="Total Days" value={formatDays(totalDays)} />
  <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
  <KpiCard label="Total Budget Cost" value={formatCurrency(totalBudgetCost)} />
  <KpiCard label="Total Margin" value={formatCurrency(totalRevenue - totalBudgetCost)} variant="highlight" />
</div>
```

**Step 2: actuals-tab.tsx**

Replace the inline metric spans (Cost: / Sell:) with `<MetricStrip>`:

```tsx
<MetricStrip items={[
  { label: 'Cost', value: <ColorValue value={periodCost} format="currency" /> },
  { label: 'Sell', value: <ColorValue value={periodSell} format="currency" sentiment="neutral" /> },
]} />
```

**Step 3: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add packages/web/src/pages/projects/snapshot-detail/
git commit -m "refactor(snapshot-detail): replace raw HTML summary cards with KpiCard and MetricStrip"
```

---

## Task 13: Refactor client-detail-page and login-page

**Files:**
- Modify: `packages/web/src/pages/clients/client-detail-page.tsx`
- Modify: `packages/web/src/pages/auth/login-page.tsx`

**Step 1: client-detail-page.tsx**

- Replace raw `<button className="...">` back link (line 67-73) with `<Button variant="ghost" size="sm">`
- Replace raw icon container (line 77-79) with `<IconBox icon={Building2} size="md" variant="muted" />`

**Step 2: login-page.tsx**

- Replace raw brand icon container (line 31) with `<IconBox icon={BriefcaseBusiness} size="md" variant="primary" />`

**Step 3: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add packages/web/src/pages/clients/client-detail-page.tsx packages/web/src/pages/auth/login-page.tsx
git commit -m "refactor(clients, auth): replace raw HTML icon containers with IconBox adapter"
```

---

## Task 14: Refactor project-timesheets-page — Legend

**Files:**
- Modify: `packages/web/src/pages/projects/project-timesheets-page.tsx`

**Step 1: Replace raw legend divs (lines 122-131) with Legend**

```tsx
<Legend items={[
  { swatch: 'bg-white', swatchBorder: 'border-gray-200', label: 'Frozen period — frozen cost rates' },
  { swatch: 'bg-amber-50', swatchBorder: 'border-amber-200', label: 'Open period — cost rates pending approval' },
]} />
```

**Step 2: Verify the app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add packages/web/src/pages/projects/project-timesheets-page.tsx
git commit -m "refactor(timesheets): replace raw HTML legend with Legend adapter"
```

---

## Task 15: Full sweep — find and fix remaining className overrides

**Files:**
- Search across all `pages/` for remaining `className=` on UI component imports

**Step 1: Search for remaining violations**

```bash
cd packages/web && grep -rn 'className=' src/pages/ | grep -v '// ok' | grep -v 'test' | head -60
```

Focus on: `<Button className=`, `<Badge className=`, `<Card className=`, `<Input className=`, `<TableRow className=`, `<TableCell className=`.

**Step 2: Fix each violation using the appropriate adapter or variant**

Apply the same patterns from Tasks 9-14 to any remaining files.

**Step 3: Verify the full app compiles**

Run: `cd packages/web && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add -A packages/web/src/pages/
git commit -m "refactor(pages): sweep remaining className overrides across all business components"
```

---

## Task 16: Visual verification

**Step 1: Start the dev server**

Run: `cd packages/web && pnpm dev`

**Step 2: Manually check key pages**

Navigate through and visually verify:
- `/timesheets/approvals` — approve/reject buttons look correct
- `/projects/:id/work-table` — legend, summary bar, margin insight
- `/projects/:id/period-close` — all 4 steps render correctly
- `/projects/:id/snapshots/:id` — scope tab summary cards, actuals tab metrics
- `/clients/:id` — icon box, back button
- `/login` — brand icon

**Step 3: Commit any visual fixes**

```bash
git add -A && git commit -m "fix(ui): visual adjustments after className cleanup"
```
