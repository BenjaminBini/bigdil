# Inline Planning Detail Card — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an accordion-style inline detail card below profile rows in the work table, showing planning progress, total financials, and period financials for the selected line.

**Architecture:** Click a profile row → an extra `<tr>` appears below it with a 3-zone card (Planning | Total | Period). The card reads from the existing `FrozenData` map and `GridRow` fields. One row expanded at a time (accordion). A sticky footer bar shows project-level totals.

**Tech Stack:** React 19, TailwindCSS 4, existing `cn()` utility, existing `formatCurrency`/`formatDays` helpers.

---

### Task 1: Add `expandedProfileId` state and click handler

**Files:**
- Modify: `src/pages/projects/work-table-page.tsx:942-963` (state section of `ProjectWorkTable`)
- Modify: `src/pages/projects/work-table-page.tsx:1120-1122` (profile row background)

**Step 1: Add state**

In the `ProjectWorkTable` function, after the `collapsedTasks` state (line 945), add:

```tsx
// Expanded profile row (accordion — only one at a time)
const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)
```

**Step 2: Make profile rows clickable**

In the `<tr>` for each visible row (line 1125-1131), add an `onClick` handler that only fires for profile rows:

```tsx
<tr
  key={row.id}
  className={cn(
    'group',
    rowBg,
    isGrandTotal && 'border-t-2 border-slate-300',
    isProfile && 'cursor-pointer',
    isProfile && expandedProfileId === row.id && 'ring-1 ring-inset ring-blue-300',
  )}
  onClick={isProfile ? () => setExpandedProfileId(
    expandedProfileId === row.id ? null : row.id
  ) : undefined}
>
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 2: Render the inline detail `<tr>` below the expanded profile row

**Files:**
- Modify: `src/pages/projects/work-table-page.tsx:1101-1253` (tbody section)

**Step 1: Add the expansion row**

The `visibleRows.map()` currently returns a single `<tr>` per row. Change it to return a **fragment** with two `<tr>`s when the row is the expanded profile. After the closing `</tr>` at line 1251, but still inside the `.map()` callback:

```tsx
return (
  <React.Fragment key={row.id}>
    <tr
      key={row.id}
      className={cn(
        'group',
        rowBg,
        isGrandTotal && 'border-t-2 border-slate-300',
        isProfile && 'cursor-pointer',
        isProfile && expandedProfileId === row.id && 'ring-1 ring-inset ring-blue-300',
      )}
      onClick={isProfile ? () => setExpandedProfileId(
        expandedProfileId === row.id ? null : row.id
      ) : undefined}
    >
      {/* ... existing td cells unchanged ... */}
    </tr>

    {isProfile && expandedProfileId === row.id && (
      <tr className="bg-blue-50/40">
        <td
          colSpan={1 + FROZEN_COLS.length + periods.length}
          className="px-4 py-3 border-b border-blue-200"
        >
          <PlanningDetailCard
            row={row}
            frozenData={frozenData.get(row.id) ?? null}
          />
        </td>
      </tr>
    )}
  </React.Fragment>
)
```

Note: The `key` moves to the `<React.Fragment>`. Remove it from the `<tr>`.

**Step 2: Add the `PlanningDetailCard` component stub**

Before the `WorkCell` component (line ~781), add:

```tsx
function PlanningDetailCard({
  row,
  frozenData: fd,
}: {
  row: GridRow
  frozenData: FrozenData | null
}) {
  return (
    <div className="text-xs text-slate-500">
      Planning card for: {row.label} (placeholder)
    </div>
  )
}
```

**Step 3: Add React import for Fragment**

At line 1, ensure `React` or `Fragment` is available. Since JSX transform auto-imports React, and we use `<React.Fragment>`, add at the top:

```tsx
import React, { useState, useRef } from 'react'
```

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: No errors. Clicking a profile row should show "Planning card for: [profile name] (placeholder)" below it.

---

### Task 3: Implement the three-zone card layout

**Files:**
- Modify: `src/pages/projects/work-table-page.tsx` (the `PlanningDetailCard` component)

**Step 1: Build the full card**

Replace the `PlanningDetailCard` stub with the full implementation:

```tsx
function PlanningDetailCard({
  row,
  frozenData: fd,
}: {
  row: GridRow
  frozenData: FrozenData | null
}) {
  if (!fd) return null

  const quotedDays = row.quotedDays
  const plannedDays = row.total
  const toPlan = quotedDays - plannedDays
  const progressPct = quotedDays > 0 ? Math.min((plannedDays / quotedDays) * 100, 100) : 0

  // Total financials (from frozen data)
  const totalCost = fd.tcAmount
  const totalRevenue = fd.trAmount
  const totalMargin = fd.trMargin
  const totalMarginPct = fd.trMarginPct

  // Period financials (from frozen data)
  const periodCost = fd.pcAmount
  const periodRevenue = fd.prAmount
  const periodMargin = fd.prMargin
  const periodMarginPct = fd.prMarginPct

  return (
    <div className="flex gap-6">
      {/* Zone 1: Planning */}
      <div className="flex-1 min-w-[180px]">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Planning</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Quoted</span>
            <span className="font-mono font-medium text-slate-700">{formatDays(quotedDays)}d</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Planned</span>
            <span className="font-mono font-medium text-slate-700">{formatDays(plannedDays)}d</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">To plan</span>
            <span className={cn(
              'font-mono font-semibold',
              toPlan === 0 && 'text-emerald-600',
              toPlan > 0 && 'text-amber-600',
              toPlan < 0 && 'text-red-600',
            )}>
              {toPlan > 0 ? '+' : ''}{formatDays(toPlan)}d
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-1">
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  toPlan === 0 ? 'bg-emerald-500' : toPlan < 0 ? 'bg-red-500' : 'bg-amber-500',
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-slate-200" />

      {/* Zone 2: Total */}
      <div className="flex-1 min-w-[180px]">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Total</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Cost</span>
            <span className="font-mono text-slate-700">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Revenue</span>
            <span className="font-mono text-slate-700">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Margin</span>
            <span className={cn(
              'font-mono font-semibold',
              totalMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
            )}>
              {formatCurrency(totalMargin)}
              {totalMarginPct != null && (
                <span className="text-[9px] opacity-70 ml-0.5">{totalMarginPct.toFixed(1)}%</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-slate-200" />

      {/* Zone 3: Period */}
      <div className="flex-1 min-w-[180px]">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Period</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Cost</span>
            <span className="font-mono text-slate-700">{formatCurrency(periodCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Revenue</span>
            <span className="font-mono text-slate-700">{formatCurrency(periodRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Margin</span>
            <span className={cn(
              'font-mono font-semibold',
              periodMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
            )}>
              {formatCurrency(periodMargin)}
              {periodMarginPct != null && (
                <span className="text-[9px] opacity-70 ml-0.5">{periodMarginPct.toFixed(1)}%</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors. The card should render three columns with planning data.

---

### Task 4: Add sticky project-level footer bar

**Files:**
- Modify: `src/pages/projects/work-table-page.tsx:1312-1392` (after the table `</div>`, before/replacing the Margin Insight panel)

**Step 1: Compute project-level "to plan" total**

In the `ProjectWorkTable` component, after the `frozenData` computation (line 940), add:

```tsx
// Total "to plan" across all profile rows
const totalToPlan = allRows
  .filter(r => r.kind === 'profile')
  .reduce((sum, r) => sum + (r.quotedDays - r.total), 0)
```

**Step 2: Add the footer bar**

Between the scrollable table container (`</div>` at line 1310) and the Margin Insight panel (line 1312), add:

```tsx
{/* ── PLANNING FOOTER BAR ─────────────────────────────────── */}
<div className="px-4 py-2 border-t bg-white shrink-0">
  <div className="flex items-center gap-6 text-sm">
    <div className="flex items-center gap-2">
      <span className="text-slate-500">To plan:</span>
      <span className={cn(
        'font-mono font-semibold',
        totalToPlan === 0 ? 'text-emerald-600' : totalToPlan > 0 ? 'text-amber-600' : 'text-red-600',
      )}>
        {totalToPlan > 0 ? '+' : ''}{formatDays(totalToPlan)}d
      </span>
    </div>
    <div className="w-px h-4 bg-slate-200" />
    <div className="flex items-center gap-2">
      <span className="text-slate-500">Project margin:</span>
      {(() => {
        const gtFd = frozenData.get('grand-total')
        if (!gtFd) return <span className="text-slate-400">—</span>
        return (
          <span className={cn(
            'font-mono font-semibold',
            gtFd.trMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
          )}>
            {formatCurrency(gtFd.trMargin)}
            {gtFd.trMarginPct != null && (
              <span className="text-xs opacity-70 ml-1">({gtFd.trMarginPct.toFixed(1)}%)</span>
            )}
          </span>
        )
      })()}
    </div>
    <div className="w-px h-4 bg-slate-200" />
    <div className="flex items-center gap-2">
      <span className="text-slate-500">Period margin:</span>
      {(() => {
        const gtFd = frozenData.get('grand-total')
        if (!gtFd) return <span className="text-slate-400">—</span>
        return (
          <span className={cn(
            'font-mono font-semibold',
            gtFd.prMargin >= 0 ? 'text-emerald-700' : 'text-red-600',
          )}>
            {formatCurrency(gtFd.prMargin)}
            {gtFd.prMarginPct != null && (
              <span className="text-xs opacity-70 ml-1">({gtFd.prMarginPct.toFixed(1)}%)</span>
            )}
          </span>
        )
      })()}
    </div>
  </div>
</div>
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors. Footer bar visible at the bottom with project-level totals.

---

### Task 5: Final polish and commit

**Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Run Vite build**

Run: `npx vite build`
Expected: Build succeeds with no errors.

**Step 3: Visual check**

Open the app, navigate to Project 1 work table. Click a profile row (e.g., "Senior Consultant" under a task). Verify:
- The card appears below the row
- Three zones display correct data
- Clicking another profile row closes the first and opens the new one
- Clicking the same profile row closes it
- The footer bar at the bottom shows project-level totals

**Step 4: Commit**

```bash
git add src/pages/projects/work-table-page.tsx
git commit -m "feat: add inline planning detail card on profile rows

Adds an accordion-style card below profile rows showing:
- Planning progress (quoted/planned/to-plan with progress bar)
- Total financials (cost, revenue, margin)
- Period financials (cost, revenue, margin for active period)
Plus a sticky footer bar with project-level totals.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
