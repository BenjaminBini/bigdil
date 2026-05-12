# UI AO Analyser Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt AO Analyser's indigo-purple brand and KPI eyebrow polish in newbil without restructuring layout, sidebar, or topbar.

**Architecture:** Single source of truth via CSS variable tokens in `index.css`. Three small surgical component edits (`kpi-card.tsx`, `sidebar.tsx`). All other indigo cascade comes for free via Tailwind v4 `@theme inline` → shadcn primitives.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4 (CSS-config), shadcn/ui, Playwright (visual regression).

**Spec:** `docs/superpowers/specs/2026-05-12-ui-evolution-ao-analyser-alignment-design.md`

**Note on TDD:** This is purely visual / CSS-token work. Component logic and signatures do not change. Verification is **Playwright visual regression** (before/after screenshots) + `tsc` + `pnpm lint` + `pnpm build`. Unit tests would not add signal here; visual diff does.

---

## File Structure

| File | Action | Why |
|---|---|---|
| `packages/web/src/index.css` | Modify | Indigo `--primary` + accent + ring tokens in both `:root` and `.dark` |
| `packages/web/src/components/shared/kpi-card.tsx` | Modify | Bump padding to `p-5`, eyebrow tracking → `tracking-widest`, font-size → `text-[11px]` |
| `packages/web/src/components/layout/sidebar.tsx` | Modify | BigDil tile from `size-7 rounded-md` to `size-9 rounded-xl` |
| `packages/web/src/components/layout/topbar/active-period-badge.tsx` | Read-only audit | Confirm it uses custom classes (it does), not default Badge variant. No edit. |
| `screenshots-before/`, `screenshots-after/` | Create (gitignored) | Visual regression baseline + result |

No new files. No moves. No primitive churn.

---

## Task 0: Capture baseline screenshots

**Files:**
- Create: `screenshots-before/` (one-off, gitignored)

- [ ] **Step 1: Ensure dev server is up**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7777/`
Expected: `200`

If not 200: `cd /Users/benjaminbini/dev/newproj/newbil && ./dev.sh` (in a separate terminal) and wait for vite output.

- [ ] **Step 2: Add screenshots dirs to .gitignore**

Edit `.gitignore`, add at end:

```
screenshots-before/
screenshots-after/
.playwright-mcp/
```

- [ ] **Step 3: Capture before screenshots via Playwright MCP**

Use the Playwright MCP browser to:

1. Navigate `http://localhost:7777/dashboard` (light)
2. Screenshot to `screenshots-before/dashboard-light.png` (viewport only)
3. Toggle dark via the topbar theme button
4. Screenshot to `screenshots-before/dashboard-dark.png`
5. Toggle back to light
6. Navigate `http://localhost:7777/projects` → `screenshots-before/projects-light.png`
7. Click first project row in projects table to land on a project detail
8. Screenshot to `screenshots-before/project-detail-light.png`

If MCP browser is not available in the executing context, equivalent: use the host's Playwright suite (`pnpm e2e:headed`) and take ad-hoc screenshots, or skip capture and rely on manual visual diff. Document which path you took in the commit message.

- [ ] **Step 4: Commit `.gitignore` change**

```bash
git add .gitignore
git commit -m "chore: ignore screenshot baselines for ui alignment work"
```

---

## Task 1: Brand tokens (indigo as `--primary`)

**Files:**
- Modify: `packages/web/src/index.css` (`:root` block starting around line 41, `.dark` block starting around line 75)

- [ ] **Step 1: Edit `:root` block — replace `--primary`, `--primary-foreground`, `--ring`, `--accent`, `--accent-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`**

Find the existing `:root {` block in `packages/web/src/index.css`. Replace these specific token lines (leave every other token untouched):

```css
    --primary: oklch(0.55 0.22 265);
    --primary-foreground: oklch(0.985 0 0);
    --accent: oklch(0.96 0.02 265);
    --accent-foreground: oklch(0.45 0.18 265);
    --ring: oklch(0.55 0.22 265 / 0.5);
    --sidebar-primary: oklch(0.55 0.22 265);
    --sidebar-primary-foreground: oklch(0.985 0 0);
```

Do NOT touch `--background`, `--foreground`, `--card`, `--secondary`, `--muted`, `--destructive`, `--border`, `--input`, `--chart-1..5`, `--sidebar` (bg), `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`.

- [ ] **Step 2: Edit `.dark` block — same set of tokens, dark variants**

In the `.dark {` block of the same file, replace the matching token lines with:

```css
    --primary: oklch(0.62 0.22 265);
    --primary-foreground: oklch(0.985 0 0);
    --accent: oklch(0.255 0.04 265);
    --accent-foreground: oklch(0.78 0.16 265);
    --ring: oklch(0.62 0.22 265 / 0.6);
    --sidebar-primary: oklch(0.62 0.22 265);
    --sidebar-primary-foreground: oklch(0.985 0 0);
```

Leave all other tokens in `.dark` untouched (including the existing comment lines).

- [ ] **Step 3: Type-check + build**

Run: `cd packages/web && pnpm build`
Expected: success, zero errors. (Pure CSS change, but build catches any unrelated regression.)

- [ ] **Step 4: Visual smoke**

With dev server running (`pnpm dev` in `packages/web`), open `http://localhost:7777/dashboard` in a browser.

Expected:
- Sidebar `BigDil` tile background is indigo
- Primary buttons (e.g. "Nouveau projet" on `/projects`) are indigo with white text
- Focus rings on inputs are indigo
- Default badges are indigo (audit Task 4 confirms only one such usage exists and it's already custom-classed)
- Charts unchanged
- Green "En cours" status pills unchanged
- Light + dark both render without contrast regressions

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/index.css
git commit -m "feat(ui): indigo-purple as primary brand token

Aligns newbil with AO Analyser. Cascades to default buttons, badges,
focus rings, and sidebar active state via Tailwind v4 @theme inline."
```

---

## Task 2: KPI card eyebrow polish

**Files:**
- Modify: `packages/web/src/components/shared/kpi-card.tsx` (lines 26-32 + lines 72-77)

The existing `KpiCard` primitive is already used by:
- `packages/web/src/pages/dashboard/kpi-strip.tsx` (4 dashboard tiles)
- Any other surface that imports `@/components/shared/kpi-card`

Editing this one file changes every consumer at once. No call-site edits needed.

**Note on project overview "info blocks":** The spec mentions polishing `pages/projects/**/overview*` stat blocks. On inspection, `ProjectDetailsCard` (the equivalent surface in newbil) uses `DetailRow` (label/value list pattern), not `KpiCard` (eyebrow + value stat pattern). It is structurally different from AO Analyser's CLIENT / RÉFÉRENCE / DATE LIMITE tiles. Out of scope for this token+accent pass; revisit if you later want a "tiles-style" project header.

- [ ] **Step 1: Bump container padding `p-4` → `p-5` for non-inline variants**

In `kpi-card.tsx`, replace the `VARIANT_CONTAINER` map:

```ts
const VARIANT_CONTAINER: Record<KpiCardVariant, string> = {
  default: 'border p-5 border-border bg-card',
  highlight: 'border p-5 border-green-200 bg-green-50',
  warning: 'border p-5 border-amber-200 bg-amber-50',
  dim: 'border p-5 border-border bg-card opacity-60',
  inline: '',
}
```

- [ ] **Step 2: Polish the eyebrow label classes**

In the same file, find the existing label `<p>` (around line 73):

```tsx
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
```

Replace with:

```tsx
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
```

- [ ] **Step 3: Type-check + build**

Run: `cd packages/web && pnpm build`
Expected: success.

- [ ] **Step 4: Visual smoke**

Open `http://localhost:7777/dashboard`.

Expected:
- 4 KPI cards have more breathing room
- Eyebrow labels (VALEUR CONTRACTUELLE TOTALE, MARGE PRÉVISIONNELLE TOTALE, PROJETS EN COURS, APPROBATIONS EN ATTENTE) feel tighter, smaller, more tracked
- Value text size unchanged
- Highlight (green) and warning (amber) variants still readable

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/components/shared/kpi-card.tsx
git commit -m "refactor(ui): polish KpiCard eyebrow + padding for AO Analyser feel"
```

---

## Task 3: BigDil sidebar logo tile

**Files:**
- Modify: `packages/web/src/components/layout/sidebar.tsx` (line 15-20)

- [ ] **Step 1: Restyle the tile element**

In `sidebar.tsx`, replace the current header block:

```tsx
      <div className={cn('flex h-14 items-center border-b px-3', collapsed ? 'justify-center' : 'gap-2')}>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-xs font-bold">B</span>
        </div>
        {!collapsed && <span className="text-base font-semibold tracking-tight">BigDil</span>}
      </div>
```

with:

```tsx
      <div className={cn('flex h-14 items-center border-b px-3', collapsed ? 'justify-center' : 'gap-2.5')}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <span className="text-sm font-bold">B</span>
        </div>
        {!collapsed && <span className="text-base font-semibold tracking-tight">BigDil</span>}
      </div>
```

Changes only: `size-7` → `size-9`, `rounded-md` → `rounded-xl`, `text-xs` → `text-sm`, added `shadow-sm`, `gap-2` → `gap-2.5`.

- [ ] **Step 2: Type-check + build**

Run: `cd packages/web && pnpm build`
Expected: success.

- [ ] **Step 3: Visual smoke**

Open `http://localhost:7777/dashboard`.

Expected:
- Sidebar tile is bigger, rounder, indigo, with a tiny shadow lift
- Sidebar header row height (`h-14`) unchanged → no layout shift in topbar alignment
- Collapsed sidebar still centers the tile

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/layout/sidebar.tsx
git commit -m "feat(ui): restyle BigDil sidebar tile to match AO Analyser"
```

---

## Task 4: Default-Badge audit

**Files:**
- Read-only: `packages/web/src/components/layout/topbar/active-period-badge.tsx`
- Read-only grep across `packages/web/src`

Goal: confirm no caller relies on the default `<Badge>` looking neutral. If any do, switch them to `variant="secondary"` or `variant="outline"`.

- [ ] **Step 1: Grep for `<Badge` usages**

Run: `cd packages/web && grep -rn "<Badge" src`

Expected matches:
- `src/components/layout/topbar/active-period-badge.tsx` (3 hits — all with explicit `className` overriding bg/text colors; default cascade is shadowed; no edit needed)
- `src/pages/dashboard/alerts-card.tsx:57` (`variant="outline"`; no edit needed)

If any match shows a plain `<Badge>` (no className, no variant) being used as a neutral chip: switch that one to `<Badge variant="secondary">`. Otherwise skip Step 2.

- [ ] **Step 2: Adjust any unsafe default Badge usage**

(Only run if Step 1 found one.) Open the offending file, change `<Badge>` → `<Badge variant="secondary">`, save.

- [ ] **Step 3: Visual smoke**

Reload `/dashboard` and any page containing `<Badge>`. Nothing should look broken — neutral chips stay neutral, intentional indigo chips stay indigo.

- [ ] **Step 4: Commit (only if Step 2 changed a file)**

```bash
git add <files>
git commit -m "refactor(ui): keep neutral badges on secondary variant after indigo primary"
```

If no files changed, skip the commit.

---

## Task 5: Visual regression — after screenshots + diff review

**Files:**
- Create: `screenshots-after/` (gitignored)

- [ ] **Step 1: Capture after screenshots**

Mirror Task 0 step 3 with the new output dir:

1. `http://localhost:7777/dashboard` light → `screenshots-after/dashboard-light.png`
2. Toggle dark → `screenshots-after/dashboard-dark.png`
3. Back to light, `/projects` → `screenshots-after/projects-light.png`
4. Project detail → `screenshots-after/project-detail-light.png`

- [ ] **Step 2: Side-by-side visual review**

Open `screenshots-before/dashboard-light.png` and `screenshots-after/dashboard-light.png`.

Acceptance checklist:
- [ ] Sidebar tile is indigo rounded-xl size-9
- [ ] KPI cards have visibly more padding + tighter eyebrow
- [ ] Primary buttons are indigo
- [ ] Focus ring on the search input (`/projects`) is indigo
- [ ] Charts unchanged
- [ ] Green status pills unchanged
- [ ] Destructive red unchanged
- [ ] Dark mode: indigo readable, no white-on-white or low-contrast surfaces
- [ ] No accidental layout shifts (sidebar width, topbar height, card widths)

If any item fails, return to the relevant task and adjust.

- [ ] **Step 3: Run app-wide checks**

Run in `packages/web`:

```bash
pnpm lint
pnpm build
```

Expected: both succeed.

- [ ] **Step 4: Component-size check**

Run: `cd packages/web && pnpm check:component-size`
Expected: pass. (Our edits did not change file lengths meaningfully.)

- [ ] **Step 5: No commit needed**

This task is verification only.

---

## Task 6: Final verification + optional squash

**Files:** none

- [ ] **Step 1: Review the four commits on this branch**

Run: `git log --oneline main..HEAD`
Expected: 3-4 commits (gitignore, tokens, kpi-card, sidebar; badge audit commit only if it changed a file).

- [ ] **Step 2: Confirm working tree clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 3: Optional — squash if you want a single landing commit**

Only if a single commit is desired on `main`:

```bash
git rebase -i main
# Mark the 3 feature commits as "fixup" / "squash" under the first one.
# Final message:
#   refactor(ui): adopt AO Analyser indigo brand + KPI card polish
```

Skip this step if per-commit history is preferred.

- [ ] **Step 4: Done. Hand back to user for visual sign-off.**

---

## Acceptance Criteria (overall)

- [ ] `--primary` token is indigo-purple in light + dark
- [ ] BigDil sidebar tile is size-9 rounded-xl indigo with white glyph
- [ ] `KpiCard` has `p-5` and `text-[11px] tracking-widest` eyebrow
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm check:component-size` passes
- [ ] Visual screenshots show expected change with no regressions
- [ ] No new files except gitignored screenshot dirs
- [ ] No sidebar / topbar / layout structural changes
- [ ] Green status pills + destructive red + charts unchanged
