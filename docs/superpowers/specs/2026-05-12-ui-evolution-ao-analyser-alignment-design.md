# UI Evolution — AO Analyser Visual Alignment

**Date:** 2026-05-12
**Scope:** newbil web (`packages/web`)
**Reference UI:** AO Analyser at `http://localhost:5173/`

## Goal

Make the newbil UI feel like a sibling of AO Analyser by adopting its **indigo-purple primary brand**, polished **stat-card eyebrow + padding** patterns, and the **rounded indigo logo tile**. Newbil's overall information architecture (sidebar shell, topbar with breadcrumb + week strip, page layouts) stays intact.

## Non-goals

- No sidebar removal or layout restructure
- No new "hero" page-header pattern (eyebrow + big h1 + subtitle on every page)
- No black-CTA variant (AO Analyser uses black; we use indigo)
- No shared `<StatCard>` primitive — restyle existing KPI cards in place
- No chart palette change
- No topbar restructure (week strip stays)
- No status-pill semantics change (green "En cours" stays green, destructive red stays red)

## Visual diff (current → target)

Captured screenshots:
- AO Analyser home: `aianalysor-home.png`
- AO Analyser project detail: `aianalysor-detail.png`
- newbil dashboard: `newbil-dashboard.png`
- newbil projects: `newbil-projects.png`

Differences to close:
1. Primary color: newbil is near-black → adopt AO Analyser indigo-purple
2. Logo tile: small `B` square → indigo rounded-xl tile with white glyph
3. Stat cards: dense shadcn defaults → larger padding + uppercase tracked eyebrow

Differences we leave alone (out of scope):
- Sidebar vs flat-header IA
- Page-level eyebrow + big h1 + subtitle
- Top-right CTA pattern

## Design

### 1. Brand tokens

Edit `packages/web/src/index.css`. Both `:root` and `.dark` blocks.

```css
:root {
  --primary: oklch(0.55 0.22 265);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.55 0.22 265 / 0.5);
  --accent: oklch(0.96 0.02 265);
  --accent-foreground: oklch(0.45 0.18 265);
  /* sidebar-primary stays in lockstep with primary */
  --sidebar-primary: oklch(0.55 0.22 265);
  --sidebar-primary-foreground: oklch(0.985 0 0);
}

.dark {
  --primary: oklch(0.62 0.22 265);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.62 0.22 265 / 0.6);
  --accent: oklch(0.255 0.04 265);
  --accent-foreground: oklch(0.78 0.16 265);
  /* sidebar-primary already indigo (0.55 0.22 265) — bump to 0.62 to match */
  --sidebar-primary: oklch(0.62 0.22 265);
}
```

Tokens unchanged: `--background`, `--foreground`, `--card`, `--secondary`, `--muted`, `--destructive`, `--border`, `--input`, charts (`--chart-1..5`), sidebar background/foreground/border.

Side effect (intended): every consumer of `--primary` flips to indigo — default buttons, default badges, focus rings, active sidebar item, tab active indicator (if wired to `--primary`).

### 2. Indigo surfaces (no component edits)

These flip automatically via the token cascade:

| Surface | Result |
|---|---|
| `Button variant="default"` | indigo bg + white text |
| `Badge variant="default"` | indigo bg + white text |
| Input focus ring | indigo |
| Sidebar active item | indigo |
| Tabs active indicator | indigo (if it reads `--primary`) |

Semantics stay: green status pills, red destructive, neutral muted backgrounds.

### 3. BigDil sidebar logo tile

File: `packages/web/src/components/layout/sidebar.tsx` (or wherever the `B` block lives in the sidebar header).

```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
  B
</div>
```

Wordmark next to it stays as-is. Collapsed sidebar shows only the tile.

### 4. KPI / stat card restyle

Apply this recipe to existing KPI cards — **no new shared primitive**.

```tsx
<Card className="p-5">
  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
    Valeur contractuelle totale
  </p>
  <p className="mt-2 text-2xl font-semibold tabular-nums">333 750 €</p>
  <p className="mt-1 text-xs text-muted-foreground">Sur tous les devis validés</p>
</Card>
```

Surfaces:
- Dashboard top tiles: VALEUR / MARGE / PROJETS / APPROBATIONS
- Project overview info blocks: CLIENT / RÉFÉRENCE / DATE LIMITE / etc.

If a tile already uses an eyebrow, just normalize classes + bump padding to `p-5`.

### 5. Link hover

In `index.css` (global), only if needed:

```css
a:hover { color: var(--primary); }
```

Scope: body-copy `<a>`, not nav buttons.

## Files touched

| File | Change |
|---|---|
| `packages/web/src/index.css` | Token updates in `:root` + `.dark`. Optional link-hover rule. |
| `packages/web/src/components/layout/sidebar.tsx` | Restyle BigDil tile (indigo rounded-xl). |
| `packages/web/src/pages/dashboard/*` | Padding + eyebrow class on 4 top KPI tiles. |
| `packages/web/src/pages/projects/**/overview*` | Padding + eyebrow polish on stat blocks. |

Estimated diff: ~5 files, < 150 lines net.

## Validation

- Playwright screenshots before/after for: `/dashboard`, `/projects`, one project detail — light + dark
- Manual dark-mode contrast check on indigo `bg-primary` buttons (target AA, expect pass with white foreground at L=0.62)
- `pnpm lint` (web)
- `pnpm build` (web)
- Smoke: sidebar active state, button focus, badge default

## Rollout

Single commit on a topic branch:
- `refactor(ui): adopt AO Analyser indigo brand + KPI card polish`

No feature flag. Visual change only, no behavior change.

## Risks

| Risk | Mitigation |
|---|---|
| Indigo clashes with existing chart palette | Charts use distinct `--chart-1..5`; not touched. Visual check on dashboards with charts. |
| Status pills (green/red) feel disconnected from brand | Acceptable — semantic. AO Analyser also uses green/red/amber alongside indigo. |
| Default `Badge` previously used as neutral chip becomes loud indigo | Audit `Badge` usages; switch any that should stay neutral to `variant="secondary"` or `"outline"`. |
| Active-tab styling reads `--ring` not `--primary` | Verify in `components/ui/tabs.tsx`; adjust at restyle time only if needed. |
